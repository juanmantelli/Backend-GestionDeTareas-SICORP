import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
    const { nombre, apellido, email, password, rol } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            nombre,
            apellido,
            email,
            password: hashedPassword,
            rol,
        });

        res.status(201).json({
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            rol: user.rol,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const { rows: users, count: total } = await User.findAndCountAll({
            attributes: { exclude: ["password"] },
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });
        res.json({ users, total });
    } catch (error) {
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
    const { nombre, rol } = req.body;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        if (nombre) user.nombre = nombre;
        if (rol) user.rol = rol;
        await user.save();
        res.json({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
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