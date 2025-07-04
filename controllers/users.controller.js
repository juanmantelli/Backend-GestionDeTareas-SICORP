import User from "../models/user.model.js";
import Cliente from "../models/client.model.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
    const { nombre, apellido, email, password, rol, clienteId } = req.body; // <-- agregar clienteId

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            nombre,
            apellido,
            email,
            password: hashedPassword,
            rol,
        };

        if (rol === "cliente" && clienteId) {
            userData.clienteId = clienteId;
        }

        const user = await User.create(userData);

        res.status(201).json({
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            rol: user.rol,
            clienteId: user.clienteId,
        });
    } catch (error) {
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({ errors });
        }

        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const getUsers = async (req, res) => {
    const { page = 1, limit = 10, rol } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (rol) where.rol = rol;
    try {
        const { rows: users, count: total } = await User.findAndCountAll({
            where,
            attributes: { exclude: ["password"] },
            include: [{ model: Cliente, as: "cliente" }],
            limit: parseInt(limit),
            offset,
            order: [["createdAt", "DESC"]],
        });
        res.json({ users, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id, {
            attributes: { exclude: ["password"] }
        });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre, rol, email, apellido, clienteId } = req.body;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        if (nombre) user.nombre = nombre;
        if (rol) user.rol = rol;
        if (email) user.email = email;
        if (apellido) user.apellido = apellido;

        if (clienteId !== undefined) {
            if ((rol || user.rol) === "cliente") {
                user.clienteId = clienteId;
            } else {
                user.clienteId = null;
            }
        }

        await user.save();
        res.json({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            apellido: user.apellido,
            clienteId: user.clienteId,
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        await user.destroy();
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const changePassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ message: "La nueva contraseña es obligatoria" });
    }
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};