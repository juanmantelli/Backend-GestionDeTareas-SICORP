import bcrypt from "bcryptjs";
import { Cliente, Sistema, User } from "../models/index.js";

// Crear cliente
export const createCliente = async (req, res) => {
  const { nombre, apellido, email, password, sistemas } = req.body;
  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: "El usuario ya existe" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rol: "cliente",
    });

    // Crea el cliente y lo asocia al usuario
    const cliente = await Cliente.create({
      nombre,
      apellido,
      email,
      usuarioId: user.id,
    });

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

export const updateCliente = async (req, res) => {
  const { nombre, apellido, email, sistemas } = req.body;
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });

    await cliente.update({ nombre, apellido, email });

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

export const changeClientePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });

    const user = await User.findByPk(cliente.usuarioId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await user.update({ password: hashedPassword });

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};
export const getClienteByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const cliente = await Cliente.findOne({ where: { usuarioId: userId } });
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};