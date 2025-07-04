import express from "express";
import {
  createCliente,
  getClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
  getClienteByUser
} from "../controllers/clients.controller.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/by-user/:userId",protect, getClienteByUser); 

router.use(protect, authorize("admin"));

router.post("/", createCliente);
router.get("/", getClientes);
router.get("/:id", getClienteById);
router.put("/:id", updateCliente);
router.delete("/:id", deleteCliente);


export default router;