import express from "express";
import {
  createCategoria,
  getCategorias,
  getCategoriaById,
  updateCategoria,
  deleteCategoria
} from "../controllers/categories.controller.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin", "cliente"));

router.post("/", createCategoria);
router.get("/", getCategorias);
router.get("/:id", getCategoriaById);
router.put("/:id", updateCategoria);
router.delete("/:id", deleteCategoria);

export default router;