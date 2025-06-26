import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Proteger rutas
export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            console.log("JWT_SECRET usado:", process.env.JWT_SECRET);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ["password"] }
            });

            if (!req.user) {
                return res.status(401).json({ message: "Usuario no encontrado" });
            }

            next();
        } catch (error) {
            console.error("JWT error:", error); // <--- Agrega este log
            return res.status(401).json({ message: "Token no válido" });
        }
    } else {
        return res.status(401).json({ message: "No autorizado, no hay token" });
    }
};
// Middleware para verificar rol
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ message: "No tienes permisos para esta acción" });
        }
        next();
    };
};