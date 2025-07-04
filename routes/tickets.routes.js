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
  tomarTicket, 
  reasignarTicket
} from "../controllers/tickets.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload, { multerErrorHandler } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.array("archivosAdjuntos"), createTicket, multerErrorHandler);

router.get("/", getTickets);
router.get("/:id", getTicketById);
router.delete("/:id", deleteTicket);
router.get("/:id/historial", getTicketHistorial);
router.put('/:id/horas', updateHorasTicket);
router.post('/:ticketId/comentarios', crearComentario);
router.get('/:ticketId/comentarios', getComentariosByTicket);
router.put("/:id", upload.array("archivosAdjuntos"), updateTicket, multerErrorHandler);
router.post("/:id/tomar",tomarTicket);
router.post("/:id/reasignar",reasignarTicket);

export default router;