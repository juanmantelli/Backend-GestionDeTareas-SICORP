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
import upload, { multerErrorHandler, getS3SignedUrl } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.array("archivosAdjuntos"), createTicket, multerErrorHandler);

router.get("/", getTickets);
router.get("/:id", getTicketById);
router.delete("/:id", deleteTicket);
router.get("/:id/historial", getTicketHistorial);
router.put('/:id/horas', updateHorasTicket);
router.post('/:ticketId/comentarios',upload.array('archivosAdjuntos'), crearComentario, multerErrorHandler);
router.get('/:ticketId/comentarios', getComentariosByTicket);
router.put("/:id", upload.array("archivosAdjuntos"), updateTicket, multerErrorHandler);
router.post("/:id/tomar",tomarTicket);
router.post("/:id/reasignar",reasignarTicket);
router.get("/archivo-url/:key", async (req, res) => {
  try {
    const url = await getS3SignedUrl(req.params.key);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: "No se pudo generar la URL" });
  }
});

export default router;