import Sistema from "../models/system.model.js";
import Cliente from "../models/client.model.js";
import User from "../models/user.model.js";
import Ticket from "../models/ticket.model.js";
import { Op } from "sequelize";

export const createSistema = async (req, res) => {
  const { nombre, fechaDesde, fechaHasta, clienteId, usuarios = [], horasSoporte, horasDesarrollo, horasModificacion } = req.body;
  try {
    const sistema = await Sistema.create({
      nombre,
      fechaDesde,
      fechaHasta,
      clienteId,
      horasSoporte,
      horasDesarrollo,
      horasModificacion
    });

    if (usuarios.length > 0) {
      const usuariosValidos = await User.findAll({
        where: {
          id: usuarios,
          clienteId
        }
      });
      await sistema.setUsuarios(usuariosValidos.map(u => u.id));
    }

    const sistemaConClienteYUsuarios = await Sistema.findByPk(sistema.id, {
      include: [
        Cliente,
        { model: User, as: "usuarios", attributes: ["id", "nombre", "apellido", "email"] }
      ]
    });
    res.status(201).json(sistemaConClienteYUsuarios);
  } catch (error) {
    console.error("Error al crear sistema:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const updateSistema = async (req, res) => {
  const { nombre, fechaDesde, fechaHasta, clienteId, usuarios = [], horasSoporte, horasDesarrollo, horasModificacion } = req.body;
  try {
    const sistema = await Sistema.findByPk(req.params.id);
    if (!sistema) return res.status(404).json({ message: "Sistema no encontrado" });

    await sistema.update({ nombre, fechaDesde, fechaHasta, clienteId, horasSoporte, horasDesarrollo, horasModificacion });

    if (usuarios.length > 0) {
      const usuariosValidos = await User.findAll({
        where: {
          id: usuarios,
          clienteId
        }
      });
      await sistema.setUsuarios(usuariosValidos.map(u => u.id));
    } else {
      await sistema.setUsuarios([]);
    }

    const sistemaActualizado = await Sistema.findByPk(sistema.id, {
      include: [
        Cliente,
        { model: User, as: "usuarios", attributes: ["id", "nombre", "apellido", "email"] }
      ]
    });
    res.json(sistemaActualizado);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getSistemas = async (req, res) => {
  try {
    const { clienteId } = req.query;
    let where = {};
    if (clienteId) where.clienteId = clienteId;
    const sistemas = await Sistema.findAll({
      where,
      include: [
        Cliente,
        { model: User, as: "usuarios", attributes: ["id", "nombre", "apellido", "email"] }
      ]
    });
    return res.json(sistemas);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getSistemaById = async (req, res) => {
  try {
    const sistema = await Sistema.findByPk(req.params.id, {
      include: [
        Cliente,
        { model: User, as: "usuarios", attributes: ["id", "nombre", "apellido", "email"] }
      ]
    });
    if (!sistema) return res.status(404).json({ message: "Sistema no encontrado" });
    res.json(sistema);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const deleteSistema = async (req, res) => {
  try {
    const sistema = await Sistema.findByPk(req.params.id);
    if (!sistema) return res.status(404).json({ message: "Sistema no encontrado" });
    await sistema.destroy();
    res.json({ message: "Sistema eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getResumenHorasMensual = async (req, res) => {
  const { id } = req.params;
  try {
    const sistema = await Sistema.findByPk(id);
    if (!sistema) {
      return res.status(404).json({ message: "Sistema no encontrado" });
    }
    const clienteId = sistema.clienteId;

    const meses = [];
    let fecha = new Date(sistema.fechaDesde);
    const fechaHasta = new Date(sistema.fechaHasta);

    while (fecha <= fechaHasta) {
      const anio = fecha.getFullYear();
      const mes = fecha.getMonth();
      const desde = new Date(anio, mes, 1, 0, 0, 0, 0);
      const hasta = new Date(anio, mes + 1, 0, 23, 59, 59, 999);

      meses.push({
        anio,
        mes: mes + 1,
        desde,
        hasta
      });

      fecha = new Date(anio, mes + 1, 1, 0, 0, 0, 0);
    }

    const resumen = [];
    for (const m of meses) {
      const tickets = await Ticket.findAll({
        where: {
          sistemaId: sistema.id,
          clienteId: clienteId,
          fechaCierre: {
            [Op.between]: [m.desde, m.hasta]
          }
        }
      });

      const horasSoporteConsumidas = tickets
        .filter(t => t.categoriaTipo === "Soporte")
        .reduce((sum, t) => sum + (t.horasCargadas || 0), 0);

      const horasDesarrolloConsumidas = tickets
        .filter(t => t.categoriaTipo === "Desarrollo")
        .reduce((sum, t) => sum + (t.horasCargadas || 0), 0);

      const horasModificacionConsumidas = tickets
        .filter(t => t.categoriaTipo === "Modificación")
        .reduce((sum, t) => sum + (t.horasCargadas || 0), 0);

      resumen.push({
        anio: m.anio,
        mes: m.mes,
        horasSoporte: sistema.horasSoporte,
        horasSoporteConsumidas,
        horasSoporteRestantes: sistema.horasSoporte - horasSoporteConsumidas,
        horasDesarrollo: sistema.horasDesarrollo,
        horasDesarrolloConsumidas,
        horasDesarrolloRestantes: sistema.horasDesarrollo - horasDesarrolloConsumidas,
        horasModificacion: sistema.horasModificacion,
        horasModificacionConsumidas,
        horasModificacionRestantes: sistema.horasModificacion - horasModificacionConsumidas
      });
    }

    res.json(resumen);
  } catch (error) {
    console.log("Error en getResumenHorasMensual:", error);
    res.status(500).json({ message: "Error al obtener resumen mensual" });
  }
};