import { Cliente, Sistema } from "../models/index.js";

// Crear cliente (solo nombre y email)
export const createCliente = async (req, res) => {
  const { nombre, email, sistemas } = req.body;
  try {
    const cliente = await Cliente.create({ nombre, email });

    if (Array.isArray(sistemas) && sistemas.length > 0) {
      await cliente.setSistemas(sistemas);
    }

    const clienteConSistemas = await Cliente.findByPk(cliente.id, { include: Sistema });
    res.status(201).json(clienteConSistemas);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({ include: Sistema });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, { include: Sistema });
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getClienteByUser = async (req, res) => {
  const { userId } = req.params;
  const user = req.user;

  if (user.rol !== "admin" && user.id !== Number(userId)) {
    return res.status(403).json({ message: "No autorizado" });
  }

  const cliente = await Cliente.findOne({ where: { id: user.clienteId } });
  if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
  res.json(cliente);
};

export const updateCliente = async (req, res) => {
  const { nombre, email, sistemas } = req.body;
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });

    await cliente.update({ nombre, email });

    if (Array.isArray(sistemas)) {
      await cliente.setSistemas(sistemas);
    }

    const clienteActualizado = await Cliente.findByPk(cliente.id, { include: Sistema });
    res.json(clienteActualizado);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });

    await cliente.destroy();
    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};