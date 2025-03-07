import express from "express";
import { body, param } from "express-validator";
import { 
    createTask, 
    getTasks, 
    updateTask, 
    deleteTask,
    markTaskAsFavorite
} from "../controllers/taskController.js";
import { validateRequest } from "../middlewares/validateMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Crear una tarea
router.post(
    "/",
    protect,
    [
        body("title")
            .trim()
            .notEmpty().withMessage("El título es obligatorio")
            .isLength({ min: 3 }).withMessage("El título debe tener al menos 3 caracteres"),
        body("description")
            .optional()
            .isString().withMessage("La descripción debe ser un texto"),
        validateRequest
    ],
    createTask
);

// Obtener todas las tareas (paginadas)
router.get("/", protect, getTasks);

// Actualizar una tarea por ID
router.put(
    "/:id",
    protect,
    [
        param("id").isMongoId().withMessage("ID de tarea no válido"),
        body("title")
            .optional()
            .isLength({ min: 3 }).withMessage("El título debe tener al menos 3 caracteres"),
        body("description")
            .optional()
            .isString().withMessage("La descripción debe ser un texto"),
        body("completed")
            .optional()
            .isBoolean().withMessage("El estado completado debe ser verdadero o falso"),
        body("favorite")
            .optional()
            .isBoolean().withMessage("El estado favorito debe ser verdadero o falso"),
        validateRequest
    ],
    updateTask
);

// Marcar una tarea como favorita
router.patch(
    "/:id/favorite",
    protect,
    [
        param("id").isMongoId().withMessage("ID de tarea no válido"),
        body("favorite")
            .notEmpty().withMessage("El valor de favorite es obligatorio")
            .isBoolean().withMessage("El valor de favorite debe ser verdadero o falso"),
        validateRequest
    ],
    markTaskAsFavorite
);

// Eliminar una tarea por ID
router.delete(
    "/:id",
    protect,
    [
        param("id").isMongoId().withMessage("ID de tarea no válido"),
        validateRequest
    ],
    deleteTask
);

export default router;