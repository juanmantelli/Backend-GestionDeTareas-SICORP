import Sistema from "../models/system.model.js";
import Cliente from "../models/client.model.js";

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