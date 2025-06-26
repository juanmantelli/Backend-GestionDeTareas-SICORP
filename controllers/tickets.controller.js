import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import Ticket from "../models/ticket.model.js";
import Cliente from "../models/client.model.js";
import Sistema from "../models/system.model.js";
import Categoria from "../models/category.model.js";
import User from "../models/user.model.js";
import TicketHistorial from "../models/ticketHistorial.js";
import { Comentario } from "../models/index.js";
import { Op } from "sequelize";
import { transporter } from "../config/mailTransporter.js";

// --- TEMPLATE DE EMAIL ---
function sicorpEmailTemplate({ saludo = "Hola,", mensaje, tituloTicket, estadoTicket }) {
  return `
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;padding:32px 32px 16px 32px;font-family:Arial,sans-serif;color:#222;box-shadow:0 2px 8px #0001;">
      <div style="text-align:center;">
        <img src="https://media.licdn.com/dms/image/v2/C4D0BAQGREgM5NM7bqQ/company-logo_200_200/company-logo_200_200/0/1655390831436?e=2147483647&v=beta&t=ngjDxfskoTqsxYzm53JxsQGTyPy1jkR1lJ9_VZSPzis" alt="SICORP" style="max-width:180px;margin-bottom:8px;" />
      </div>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0 24px 0;">
      <div style="font-size:1.1em;">
        <p style="margin:0 0 16px 0;"><strong>${saludo}</strong></p>
        <p style="margin:0 0 16px 0;">${mensaje}</p>
        ${tituloTicket ? `<p style="margin:0 0 8px 0;"><strong>Ticket:</strong> ${tituloTicket}</p>` : ""}
        ${estadoTicket ? `<p style="margin:0 0 8px 0;"><strong>Estado:</strong> ${estadoTicket}</p>` : ""}
      </div>
      <div style="color:#888;font-size:0.95em;margin-top:32px;text-align:center;">
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0 16px 0;">
        <div style="margin-bottom:4px;">© ${new Date().getFullYear()} SICORP SRL &middot; <a href="mailto:info@sicorpsrl.com" style="color:#1976d2;text-decoration:none;">info@sicorpsrl.com</a></div>
      </div>
    </div>
  `;
}

const enviarNotificacion = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    });
    console.log(`Correo enviado a ${to}: ${subject}`);
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
};

async function registrarHistorial({ ticket, usuarioId, usuarioAsignadoId, accion, estadoAnterior, estadoNuevo, observacion }) {
  await TicketHistorial.create({
    ticketId: ticket.id,
    usuarioId,
    usuarioAsignadoId,
    accion,
    estadoAnterior,
    estadoNuevo,
    fecha: new Date(),
    observacion
  });
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const createTicket = async (req, res) => {
  const { titulo, descripcion, categoriaId, sistemaId, clienteId } = req.body;
  let archivoAdjuntoUrl = null;
  const categoriaAbierto = await Categoria.findOne({ where: { nombre: "Abierto" } });

  try {
    if (req.file) {
      const fileContent = fs.readFileSync(req.file.path);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: Date.now() + path.extname(req.file.originalname),
        Body: fileContent,
        ContentType: req.file.mimetype
      };
      const data = await s3.upload(params).promise();
      archivoAdjuntoUrl = data.Location;
      fs.unlinkSync(req.file.path);
    }

    const ticket = await Ticket.create({
      titulo,
      descripcion,
      archivoAdjunto: archivoAdjuntoUrl,
      categoriaId: categoriaAbierto.id,
      sistemaId,
      clienteId,
      usuarioId: req.user.id
    });

    await registrarHistorial({
      ticket,
      usuarioId: req.user.id,
      usuarioAsignadoId: req.user.id,
      accion: "crear",
      estadoAnterior: null,
      estadoNuevo: "Abierto",
      observacion: "Ticket creado"
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getTickets = async (req, res) => {
  const { clienteId, categoriaId, usuarioId, sistemaId, fechaInicio, fechaFin, page = 1, limit = 10 } = req.query;
  const where = {};
  if (clienteId) where.clienteId = clienteId;
  if (categoriaId) where.categoriaId = categoriaId;
  if (usuarioId) where.usuarioId = usuarioId;
  if (sistemaId) where.sistemaId = sistemaId;

  if (fechaInicio && fechaFin) {
    where.createdAt = { [Op.between]: [fechaInicio, fechaFin] };
  } else if (fechaInicio) {
    where.createdAt = { [Op.gte]: fechaInicio };
  } else if (fechaFin) {
    where.createdAt = { [Op.lte]: fechaFin };
  }

  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: tickets, count: total } = await Ticket.findAndCountAll({
      where,
      include: [Cliente, Sistema, Categoria, User],
      limit: parseInt(limit),
      offset,
      order: [['id', 'DESC']]
    });
    res.json({ tickets, total });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [Cliente, Sistema, Categoria, User]
    });
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const updateTicket = async (req, res) => {
  const { horasCargadas, categoriaId, usuarioId, cerrar } = req.body;
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
    let archivoAdjuntoUrl = ticket.archivoAdjunto;
    if (req.file) {
      // Subir nuevo archivo a S3
      const fileContent = fs.readFileSync(req.file.path);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: Date.now() + path.extname(req.file.originalname),
        Body: fileContent,
        ContentType: req.file.mimetype
      };
      const data = await s3.upload(params).promise();
      archivoAdjuntoUrl = data.Location;
      fs.unlinkSync(req.file.path);

    }
    if (archivoAdjuntoUrl !== ticket.archivoAdjunto) {
      ticket.archivoAdjunto = archivoAdjuntoUrl;
    }

    if (req.body.titulo !== undefined) ticket.titulo = req.body.titulo;
    if (req.body.descripcion !== undefined) ticket.descripcion = req.body.descripcion;
    if (req.body.sistemaId !== undefined) ticket.sistemaId = req.body.sistemaId;
    if (req.body.clienteId !== undefined) ticket.clienteId = req.body.clienteId;
    if (req.body.usuarioId !== undefined && req.body.usuarioId !== ticket.usuarioId) {
      ticket.usuarioId = req.body.usuarioId;
    }

    if (categoriaId && categoriaId !== ticket.categoriaId) {
      const categoriaNombreAnterior = (await Categoria.findByPk(ticket.categoriaId))?.nombre || ticket.categoriaId;
      const categoriaNombreNueva = (await Categoria.findByPk(categoriaId))?.nombre || categoriaId;

      if (categoriaNombreNueva === "Cerrado" && categoriaNombreAnterior !== "Cerrado") {
        ticket.fechaCierre = new Date();

        const cliente = await Cliente.findByPk(ticket.clienteId);
        if (cliente) {
          await enviarNotificacion(
            cliente.email,
            "Tu ticket fue cerrado",
            `El ticket "${ticket.titulo}" fue cerrado.`,
            sicorpEmailTemplate({
              mensaje: `El ticket <strong>${ticket.titulo}</strong> fue cerrado y está completo.`,
              tituloTicket: ticket.titulo,
              estadoTicket: "Cerrado"
            })
          );
        }
      }

      await registrarHistorial({
        ticket,
        usuarioId: req.user.id,
        usuarioAsignadoId: ticket.usuarioId,
        accion: "cambiar_estado",
        estadoAnterior: categoriaNombreAnterior,
        estadoNuevo: categoriaNombreNueva,
        observacion: "Cambio de estado"
      });

      ticket.categoriaId = categoriaId;
    }

    if (usuarioId && usuarioId !== ticket.usuarioId) {
      const accion = ticket.usuarioId ? "reasignar" : "tomar";
      await registrarHistorial({
        ticket,
        usuarioId: req.user.id, 
        usuarioAsignadoId: usuarioId, 
        accion,
        estadoAnterior: ticket.usuarioId ? `Usuario anterior: ${ticket.usuarioId}` : null,
        estadoNuevo: `Usuario asignado: ${usuarioId}`,
        observacion: ticket.usuarioId ? "Ticket reasignado" : "Ticket tomado"
      });
      ticket.usuarioId = usuarioId;
      ticket.tomado = true;
      const cliente = await Cliente.findByPk(ticket.clienteId);
      if (cliente) {
        await enviarNotificacion(
          cliente.email,
          "Tu ticket fue tomado",
          `El ticket "${ticket.titulo}" fue tomado por un operador.`,
          sicorpEmailTemplate({
            mensaje: `El ticket <strong>${ticket.titulo}</strong> fue tomado por un operador y está en proceso.`,
            tituloTicket: ticket.titulo,
            estadoTicket: "En proceso"
          })
        );
      }
    }

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getTicketHistorial = async (req, res) => {
  try {
    const historial = await TicketHistorial.findAll({
      where: { ticketId: req.params.id },
      include: [
        { model: User, as: "Usuario", attributes: ["id", "nombre", "email"] },
        { model: User, as: "UsuarioAsignado", attributes: ["id", "nombre", "email"] }
      ],
      order: [["fecha", "ASC"]]
    });
    res.json(historial);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el historial" });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
    await ticket.destroy();
    res.json({ message: "Ticket eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const updateHorasTicket = async (req, res) => {
  const { horasCargadas } = req.body;
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });

    if (ticket.sistemaId === null) return res.status(400).json({ message: "El ticket no tiene sistema asociado" });

    const sistema = await Sistema.findByPk(ticket.sistemaId);
    if (!sistema) return res.status(404).json({ message: "Sistema no encontrado" });

    const horasPrevias = ticket.horasCargadas || 0;
    const horasNuevas = Number(horasCargadas);
    const diferencia = horasNuevas - horasPrevias;

    if (diferencia > 0) {
      if (sistema.horasContrato < diferencia) {
        return res.status(400).json({ message: "No hay suficientes horas en el contrato" });
      }
      sistema.horasContrato -= diferencia;
    } else if (diferencia < 0) {
      sistema.horasContrato += Math.abs(diferencia);
    }
    ticket.horasCargadas = horasNuevas;
    await sistema.save();
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const crearComentario = async (req, res) => {
  const { texto, parentId } = req.body;
  try {
    console.log({
      texto,
      ticketId: req.params.ticketId,
      usuarioId: req.user.id,
      parentId: parentId || null,
      fecha: new Date()
    });
    const comentario = await Comentario.create({
      texto,
      ticketId: req.params.ticketId,
      usuarioId: req.user.id,
      parentId: parentId || null,
      fecha: new Date()
    });
    const comentarioCompleto = await Comentario.findByPk(comentario.id, {
      include: [{ model: User, as: "Usuario", attributes: ["id", "nombre", "email"] }]
    });
    res.status(201).json(comentarioCompleto);
  } catch (error) {
    console.error("Error al crear comentario:", error);
    res.status(500).json({ message: "Error al crear comentario" });
  }
};

export const getComentariosByTicket = async (req, res) => {
  try {
    const comentarios = await Comentario.findAll({
      where: { ticketId: req.params.ticketId, parentId: null },
      include: [
        { model: User, as: "Usuario", attributes: ["id", "nombre", "email"] },
        {
          model: Comentario,
          as: "Respuestas",
          include: [{ model: User, as: "Usuario", attributes: ["id", "nombre", "email"] }]
        }
      ],
      order: [["fecha", "ASC"]]
    });
    res.json(comentarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener comentarios" });
  }
};

export const tomarOReasignarTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });

    const { usuarioId } = req.body;
    if (!usuarioId) return res.status(400).json({ message: "usuarioId es requerido" });

    const usuarioAnterior = ticket.usuarioId;
    const esReasignacion = !!usuarioAnterior && usuarioAnterior !== usuarioId;

    ticket.usuarioId = usuarioId;
    ticket.tomado = true;

    await ticket.save();

    // Registrar historial
    await registrarHistorial({
      ticket,
      usuarioId: req.user.id,
      usuarioAsignadoId: usuarioId,
      accion: esReasignacion ? "reasignar" : "tomar",
      estadoAnterior: usuarioAnterior ? `Usuario anterior: ${usuarioAnterior}` : null,
      estadoNuevo: `Usuario asignado: ${usuarioId}`,
      observacion: esReasignacion ? "Ticket reasignado" : "Ticket tomado"
    });

    // Notificar al cliente
    const cliente = await Cliente.findByPk(ticket.clienteId);
    if (cliente) {
      await enviarNotificacion(
        cliente.email,
        esReasignacion ? "Tu ticket fue reasignado" : "Tu ticket fue tomado",
        `El ticket "${ticket.titulo}" fue ${esReasignacion ? "reasignado" : "tomado"} por un operador.`,
        sicorpEmailTemplate({
          mensaje: `El ticket <strong>${ticket.titulo}</strong> fue ${esReasignacion ? "reasignado" : "tomado"} por un operador y está en proceso.`,
          tituloTicket: ticket.titulo,
          estadoTicket: "En proceso"
        })
      );
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error al tomar o reasignar el ticket" });
  }
};