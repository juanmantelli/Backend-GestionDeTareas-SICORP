import express from "express";
import { horasPorCliente } from "../controllers/reports.controller.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/horas-por-cliente", horasPorCliente);

export default router;