import express from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController.js";
import { validateRequest } from "../middlewares/validateMiddleware.js";

const router = express.Router();

// Registro de usuario
router.post(
    "/register",
    [
        body("name")
            .trim()
            .notEmpty().withMessage("El nombre es obligatorio")
            .isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres"),
        
        body("email")
            .trim()
            .isEmail().withMessage("Debe ser un email válido")
            .normalizeEmail(),

        body("password")
            .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres")
            .matches(/[A-Z]/).withMessage("Debe contener al menos una letra mayúscula")
            .matches(/[0-9]/).withMessage("Debe contener al menos un número")
            .matches(/[\W]/).withMessage("Debe contener al menos un carácter especial"),
        
        validateRequest
    ],
    register
);

// Login de usuario
router.post(
    "/login",
    [
        body("email")
            .trim()
            .isEmail().withMessage("Debe ser un email válido")
            .normalizeEmail(),

        body("password")
            .notEmpty().withMessage("La contraseña es obligatoria"),

        validateRequest
    ],
    login
);

export default router;