import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generar token
const generateToken = (id, rol) => {
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res) => {
    const { nombre, apellido, email, password, rol = "cliente" } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            nombre,
            apellido,
            email,
            password: hashedPassword,
            rol,
        });

        res.status(201).json({
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                rol: user.rol,
                clienteId: user.clienteId
            },
            token: generateToken(user.id, user.rol),
        });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    rol: user.rol,
                    clienteId: user.clienteId
                },
                token: generateToken(user.id, user.rol),
            });
        } else {
            res.status(400).json({ message: "Credenciales inválidas" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};