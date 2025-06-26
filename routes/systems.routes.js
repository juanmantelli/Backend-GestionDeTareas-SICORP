import express from "express";
import {
  createSistema,
  getSistemas,
  getSistemaById,
  updateSistema,
  deleteSistema
} from "../controllers/systems.controller.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin", "cliente"));

router.post("/", createSistema);
router.get("/", getSistemas);
router.get("/:id", getSistemaById);
router.put("/:id", updateSistema);
router.delete("/:id", deleteSistema);

export default router;