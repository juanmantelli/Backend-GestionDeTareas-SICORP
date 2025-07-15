import express from "express";
import Categoria from "../models/categoria.model.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener categorías" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ message: "No encontrada" });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la categoría" });
  }
});

export default router;