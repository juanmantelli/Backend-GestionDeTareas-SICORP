import fs from "fs";
import path from "path";
import Ticket from "../models/ticket.model.js";
import Cliente from "../models/client.model.js";
import Sistema from "../models/system.model.js";
import Estado from "../models/estado.model.js";
import Categoria from "../models/categoria.model.js";
import User from "../models/user.model.js";
import SistemaCategoriaHoras from "../models/sistemaCategoria.model.js";
import TicketHistorial from "../models/ticketHistorial.js";
import Notificacion from "../models/notificacion.model.js";
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
        <div style="margin-bottom:4px;">© ${new Date().getFullYear()} SICORP SRL &middot; <a href="mailto:contacto@sicorpsrl.com" style="color:#1976d2;text-decoration:none;">info@sicorpsrl.com</a></div>
      </div>
    </div>
  `;
}

const enviarNotificacion = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: `"SICORP Tickets" <${process.env.EMAIL_USER}>`,
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

export const createTicket = async (req, res) => {
  const { titulo, descripcion = "", categoriaId, sistemaId, clienteId, prioridad, categoriaTipoId } = req.body;
  const estadoAbierto = await Estado.findOne({ where: { nombre: "Abierto" } });
  if (!estadoAbierto) {
    return res.status(400).json({ message: 'No existe el estado "Abierto" en la base de datos.' });
  }
  let archivosAdjuntos = [];
  if (req.files && req.files.length > 0) {
    archivosAdjuntos = req.files.map(file => file.key);
  }

  try {
    const ticket = await Ticket.create({
      titulo,
      descripcion: descripcion || "",
      archivosAdjuntos,
      categoriaId: estadoAbierto.id,
      sistemaId,
      clienteId,
      usuarioId: req.user.id,
      prioridad,
      categoriaTipoId,
      usuarioAsignado: null
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

    const admins = await User.findAll({ where: { rol: "admin" } });

    Promise.all([
      ...admins.map(admin =>
        Notificacion.create({
          usuarioId: admin.id,
          ticketId: ticket.id,
          comentarioId: null,
          leido: false,
          fecha: new Date(),
          tipo: "nuevo_ticket"
        })
      ),
      ...admins.map(admin =>
        enviarNotificacion(
          admin.email,
          "Nuevo ticket creado",
          `Se ha creado un nuevo ticket: "${ticket.titulo}".`,
          sicorpEmailTemplate({
            saludo: `Hola ${admin.nombre},`,
            mensaje: `Se ha creado un nuevo ticket <strong>${ticket.titulo}</strong>.`,
            tituloTicket: ticket.titulo,
            estadoTicket: "Abierto"
          })
        )
      )
    ]).catch(err => console.error("Error enviando notificaciones/correos:", err));

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getTickets = async (req, res) => {
  const { clienteId, categoriaId, usuarioId, sistemaId,usuarioAsignado, fechaInicio, fechaFin, page = 1, limit = 10, soloAbiertos } = req.query;
  const where = {};
  if (clienteId) where.clienteId = clienteId;
  if (categoriaId) where.categoriaId = categoriaId;
  if (usuarioId) where.usuarioId = usuarioId;
  if (usuarioAsignado) where.usuarioAsignado = usuarioAsignado;
  if (sistemaId) where.sistemaId = sistemaId;

  if (fechaInicio && fechaFin) {
    where.createdAt = { [Op.between]: [fechaInicio, fechaFin] };
  } else if (fechaInicio) {
    where.createdAt = { [Op.gte]: fechaInicio };
  } else if (fechaFin) {
    where.createdAt = { [Op.lte]: fechaFin };
  }

  if (soloAbiertos === "true") {
    where[Op.or] = [
      { '$Estado.nombre$': { [Op.ne]: 'Cerrado' } },
      { horasCargadas: 0 }
    ];
  }

  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: tickets, count: total } = await Ticket.findAndCountAll({
      where,
      include: [Cliente, Sistema, Estado, User, Categoria],
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
      include: [Cliente, Sistema, Estado, User, Categoria]
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
    let archivosAdjuntos = ticket.archivosAdjuntos || [];
    if (req.files && req.files.length > 0) {
      archivosAdjuntos = archivosAdjuntos.concat(req.files.map(file => file.key));
    }

    if (req.body.titulo !== undefined) ticket.titulo = req.body.titulo;
    if (req.body.descripcion !== undefined) ticket.descripcion = req.body.descripcion;
    if (req.body.sistemaId !== undefined) ticket.sistemaId = req.body.sistemaId;
    if (req.body.clienteId !== undefined) ticket.clienteId = req.body.clienteId;
    if (req.body.usuarioId !== undefined && req.body.usuarioId !== ticket.usuarioId) {
      ticket.usuarioId = req.body.usuarioId;
    }
    if (archivosAdjuntos.length > 0) ticket.archivosAdjuntos = archivosAdjuntos;

    if (categoriaId && categoriaId !== ticket.categoriaId) {
      const categoriaNombreAnterior = (await Estado.findByPk(ticket.categoriaId))?.nombre || ticket.categoriaId;
      const categoriaNombreNueva = (await Estado.findByPk(categoriaId))?.nombre || categoriaId;

      if (categoriaNombreNueva === "Cerrado" && categoriaNombreAnterior !== "Cerrado") {
        ticket.fechaCierre = new Date();
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

      const cliente = await User.findByPk(ticket.usuarioId);
      if (cliente) {
        Promise.all([
          enviarNotificacion(
            cliente.email,
            `Tu ticket cambió de estado a "${categoriaNombreNueva}"`,
            `El ticket "${ticket.titulo}" cambió de estado a "${categoriaNombreNueva}".`,
            sicorpEmailTemplate({
              mensaje: `El ticket <strong>${ticket.titulo}</strong> cambió de estado a <strong>${categoriaNombreNueva}</strong>.`,
              tituloTicket: ticket.titulo,
              estadoTicket: categoriaNombreNueva
            })
          ),
          Notificacion.create({
            usuarioId: cliente.id,
            ticketId: ticket.id,
            comentarioId: null,
            leido: false,
            fecha: new Date(),
            tipo: "cambio_estado"
          })
        ]).catch(err => console.error("Error enviando notificaciones/correos:", err));
      }
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
      const cliente = await User.findByPk(ticket.usuarioId);
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

    await Notificacion.destroy({ where: { ticketId: ticket.id } });

    await Comentario.destroy({ where: { ticketId: ticket.id } });

    await ticket.destroy();
    res.json({ message: "Ticket eliminado" });
  } catch (error) {
    console.error("Error al eliminar ticket:", error);
    res.status(500).json({ message: "Error al eliminar ticket" });
  }
};

export const updateHorasTicket = async (req, res) => {
  const { horasCargadas, forzar } = req.body;
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });

    const sistema = await Sistema.findByPk(ticket.sistemaId);
    if (!sistema) {
      return res.status(400).json({ message: "No se encontró el sistema" });
    }

    const categoriaHoras = await SistemaCategoriaHoras.findOne({
      where: {
        sistemaId: sistema.id,
        categoriaId: ticket.categoriaTipoId
      },
      include: [Categoria]
    });

    if (!categoriaHoras) {
      return res.status(400).json({ message: "No se encontraron horas contratadas para esta categoría en el sistema" });
    }

    const horasContratadas = categoriaHoras.horasContratadas;
    const campoHoras = categoriaHoras.Categoria?.nombre || "Categoría";

    const ticketsCerrados = await Ticket.findAll({
      where: {
        sistemaId: sistema.id,
        categoriaTipoId: ticket.categoriaTipoId,
        id: { [Op.ne]: ticket.id },
        fechaCierre: { [Op.not]: null }
      }
    });

    const horasCargadasOtros = ticketsCerrados.reduce((sum, t) => sum + (t.horasCargadas || 0), 0);
    const totalHoras = horasCargadasOtros + Number(horasCargadas);
    const horasRestantes = horasContratadas - totalHoras;

    if (horasRestantes < 0 && !forzar) {
      return res.status(400).json({
        message: `No quedan horas disponibles para este tipo (${campoHoras}). ¿Desea continuar y permitir saldo negativo?`,
        puedeForzar: true
      });
    }

    ticket.horasCargadas = Number(horasCargadas);
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const crearComentario = async (req, res) => {
  let { texto, parentId } = req.body;

  if (typeof texto !== "string") {
    if (Array.isArray(texto)) texto = texto[0];
    else if (typeof texto === "object" && texto !== null) texto = "";
    else texto = String(texto);
  }

  let archivosAdjuntos = [];
  if (req.files && req.files.length > 0) {
    archivosAdjuntos = req.files.map(file => file.key || file.filename || file.path);
  }

  try {
    const comentario = await Comentario.create({
      texto,
      ticketId: req.params.ticketId,
      usuarioId: req.user.id,
      parentId: parentId || null,
      fecha: new Date(),
      archivosAdjuntos 
    });

    const comentarioCompleto = await Comentario.findByPk(comentario.id, {
      include: [{ model: User, as: "Usuario", attributes: ["id", "nombre", "apellido", "email"] }]
    });

    const ticket = await Ticket.findByPk(req.params.ticketId, {
      include: [
        { model: User, as: "Usuario", attributes: ["id", "nombre", "apellido", "email"] }
      ]
    });

    let usuarioAsignado = null;
    if (ticket.usuarioAsignado) {
      usuarioAsignado = await User.findOne({
        where: {
          nombre: ticket.usuarioAsignado.split(" ")[0],
          apellido: ticket.usuarioAsignado.split(" ")[1]
        },
        attributes: ["id", "nombre", "apellido", "email"]
      });
    }

    let admins = [];
    if (!usuarioAsignado) {
      admins = await User.findAll({ where: { rol: "admin" }, attributes: ["id", "nombre", "apellido", "email"] });
    }

    const usuariosANotificar = [];
    if (ticket.Usuario && ticket.Usuario.id !== req.user.id) {
      usuariosANotificar.push(ticket.Usuario);
    }
    if (usuarioAsignado && usuarioAsignado.id !== req.user.id) {
      usuariosANotificar.push(usuarioAsignado);
    }
    if (!usuarioAsignado && admins.length > 0) {
      admins.forEach(admin => {
        if (admin.id !== req.user.id) usuariosANotificar.push(admin);
      });
    }

    Promise.all(
      usuariosANotificar.map(usuario =>
        Promise.all([
          enviarNotificacion(
            usuario.email,
            "Nuevo comentario en tu ticket",
            `Hay un nuevo comentario en el ticket "${ticket.titulo}".`,
            sicorpEmailTemplate({
              saludo: `Hola ${usuario.nombre},`,
              mensaje: `Hay un nuevo comentario en el ticket <strong>${ticket.titulo}</strong>.`,
              tituloTicket: ticket.titulo,
              estadoTicket: ticket.Categorium?.nombre || "-"
            })
          ),
          Notificacion.create({
            usuarioId: usuario.id,
            ticketId: ticket.id,
            comentarioId: comentarioCompleto.id,
            leido: false,
            fecha: new Date(),
            tipo: "nuevo_comentario"
          })
        ])
      )
    ).catch(err => console.error("Error enviando notificaciones/correos:", err));

    res.status(201).json({
      comentario: comentarioCompleto,
      ticket: {
        id: ticket.id,
        titulo: ticket.titulo,
        usuarioId: ticket.usuarioId,
        Usuario: ticket.Usuario,
        usuarioAsignado: ticket.usuarioAsignado,
        UsuarioAsignado: usuarioAsignado
      }
    });
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

export const tomarTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });

    if (ticket.usuarioAsignado) {
      return res.status(400).json({ message: "El ticket ya fue tomado o asignado." });
    }

    const usuario = await User.findByPk(req.user.id);

    const estadoEnProceso = await Estado.findOne({ where: { nombre: "En Proceso" } });
    if (!estadoEnProceso) {
      return res.status(400).json({ message: 'No existe el estado "En Proceso" en la base de datos.' });
    }

    ticket.usuarioAsignado = usuario.nombre + " " + usuario.apellido;
    ticket.tomado = true;
    ticket.categoriaId = estadoEnProceso.id;
    await ticket.save();

    await registrarHistorial({
      ticket,
      usuarioId: req.user.id,
      usuarioAsignadoId: req.user.id,
      accion: "tomar",
      estadoAnterior: null,
      estadoNuevo: `Usuario asignado: ${usuario.nombre} ${usuario.apellido}`,
      observacion: "Ticket tomado"
    });

    const cliente = await User.findByPk(ticket.usuarioId);
    if (cliente) {
      enviarNotificacion(
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

    res.json(ticket);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al tomar el ticket" });
  }
};

export const reasignarTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });

    const { usuarioId } = req.body;
    if (!usuarioId) return res.status(400).json({ message: "usuarioId es requerido" });

    const usuarioNuevo = await User.findByPk(usuarioId);
    if (!usuarioNuevo) return res.status(404).json({ message: "Usuario no encontrado" });

    const usuarioAnterior = ticket.usuarioAsignado;
    if (usuarioAnterior === (usuarioNuevo.nombre + " " + usuarioNuevo.apellido)) {
      return res.status(400).json({ message: "El ticket ya está asignado a ese usuario." });
    }

    ticket.usuarioAsignado = usuarioNuevo.nombre + " " + usuarioNuevo.apellido;
    ticket.tomado = true;
    await ticket.save();

    await registrarHistorial({
      ticket,
      usuarioId: req.user.id,
      usuarioAsignadoId: usuarioId,
      accion: "reasignar",
      estadoAnterior: `Usuario anterior: ${usuarioAnterior}`,
      estadoNuevo: `Usuario asignado: ${usuarioId}`,
      observacion: "Ticket reasignado"
    });

    const cliente = await User.findByPk(ticket.usuarioId);
    if (cliente) {
      enviarNotificacion(
        cliente.email,
        "Tu ticket fue reasignado",
        `El ticket "${ticket.titulo}" fue reasignado por un operador.`,
        sicorpEmailTemplate({
          mensaje: `El ticket <strong>${ticket.titulo}</strong> fue reasignado por un operador y está en proceso.`,
          tituloTicket: ticket.titulo,
          estadoTicket: "En proceso"
        })
      );
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error al reasignar el ticket" });
  }
};