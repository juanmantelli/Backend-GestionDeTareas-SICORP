import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getNotificaciones, marcarNotificacionesLeidas, marcarNotificacionLeida } from "../controllers/notificacion.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotificaciones);
router.post("/leer",marcarNotificacionesLeidas);
router.post("/:id/leida",marcarNotificacionLeida);

export default router;