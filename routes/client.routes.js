import express from "express";
import {
  createCliente,
  getClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
  changeClientePassword,
  getClienteByUserId
} from "../controllers/clients.controller.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get( "/by-user/:userId", protect, authorize("admin", "cliente"), getClienteByUserId);

router.use(protect, authorize("admin"));

router.post("/", createCliente);
router.get("/", getClientes);
router.get("/:id", getClienteById);
router.put("/:id", updateCliente);
router.delete("/:id", deleteCliente);
router.put("/:id/cambiar-password", changeClientePassword);

export default router;