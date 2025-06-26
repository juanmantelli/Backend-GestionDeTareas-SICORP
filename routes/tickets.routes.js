import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketHistorial,
  updateHorasTicket,
  crearComentario,
  getComentariosByTicket,
  tomarOReasignarTicket
} from "../controllers/tickets.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.single("archivoAdjunto"), createTicket);

router.get("/", getTickets);
router.get("/:id", getTicketById);
router.delete("/:id", deleteTicket);
router.get("/:id/historial", getTicketHistorial);
router.put('/:id/horas', updateHorasTicket);
router.post('/:ticketId/comentarios', crearComentario);
router.get('/:ticketId/comentarios', getComentariosByTicket);
router.put("/:id", upload.single("archivoAdjunto"), updateTicket);
router.patch("/:id/tomar-o-reasignar", tomarOReasignarTicket);

export default router;