import Sistema from "../models/system.model.js";
import Cliente from "../models/client.model.js";
import Ticket from "../models/ticket.model.js";
import { Op } from "sequelize";

export const createSistema = async (req, res) => {
  const { nombre, horasContrato, fechaDesde, fechaHasta, clientes } = req.body; 
  try {
    const sistema = await Sistema.create({
      nombre,
      horasContrato,
      fechaDesde,
      fechaHasta
    });

    if (Array.isArray(clientes) && clientes.length > 0) {
      await sistema.setClientes(clientes);
    }

    const sistemaConClientes = await Sistema.findByPk(sistema.id, { include: Cliente });
    res.status(201).json(sistemaConClientes);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getSistemas = async (req, res) => {
  try {
    const { clienteId } = req.query;
    let where = {};
    let include = [];

    if (clienteId) {
      const cliente = await Cliente.findByPk(clienteId, {
        include: {
          model: Sistema,
          through: { attributes: [] },
          include: [Cliente] 
        }
      });
      if (!cliente) return res.json([]);
      return res.json(cliente.Sistemas);
    } else {
      const sistemas = await Sistema.findAll({ include: Cliente });
      return res.json(sistemas);
    }
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getSistemaById = async (req, res) => {
  try {
    const sistema = await Sistema.findByPk(req.params.id, { include: Cliente });
    if (!sistema) return res.status(404).json({ message: "Sistema no encontrado" });
    res.json(sistema);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const updateSistema = async (req, res) => {
  const { nombre, horasContrato, fechaDesde, fechaHasta, clientes } = req.body;
  try {
    const sistema = await Sistema.findByPk(req.params.id);
    if (!sistema) return res.status(404).json({ message: "Sistema no encontrado" });

    await sistema.update({ nombre, horasContrato, fechaDesde, fechaHasta });


    if (Array.isArray(clientes)) {
      await sistema.setClientes(clientes);
    }

    const sistemaActualizado = await Sistema.findByPk(sistema.id, { include: Cliente });
    res.json(sistemaActualizado);
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
  const { id } = req.params; // id del sistema
  try {
    const sistema = await Sistema.findByPk(id);
    if (!sistema) return res.status(404).json({ message: "Sistema no encontrado" });

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
          fechaCierre: {
            [Op.between]: [m.desde, m.hasta]
          }
        }
      });
      const horasConsumidas = tickets.reduce((sum, t) => sum + (t.horasCargadas || 0), 0);
      resumen.push({
        anio: m.anio,
        mes: m.mes,
        horasContrato: sistema.horasContrato,
        horasConsumidas,
        horasRestantes: sistema.horasContrato - horasConsumidas
      });
    }

    res.json(resumen);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener resumen mensual" });
  }
};