import express from "express";
import { body, param } from "express-validator";
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    changePassword
} from "../controllers/users.controller.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.post(
    "/",
    [
        body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
        body("email").isEmail().withMessage("Debe ser un email válido"),
        body("password").isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),
        body("rol").isIn(["admin", "cliente"]).withMessage("Rol inválido"),
        validateRequest,
    ],
    createUser
);

router.get("/", getUsers);

router.get(
    "/:id",
    [param("id").isInt().withMessage("ID inválido"), validateRequest],
    getUserById
);

router.put(
    "/:id",
    [
        param("id").isInt().withMessage("ID inválido"),
        body("nombre").optional().notEmpty(),
        body("rol").optional().isIn(["admin", "cliente"]),
        validateRequest,
    ],
    updateUser
);

router.delete(
    "/:id",
    [param("id").isInt().withMessage("ID inválido"), validateRequest],
    deleteUser
);

router.put("/:id/password", changePassword);

export default router;