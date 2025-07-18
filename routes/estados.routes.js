import express from "express";
import Estado from "../models/estado.model.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin", "cliente"));

router.post("/", async (req, res) => {
  const { nombre } = req.body;
  try {
    const existe = await Estado.findOne({ where: { nombre } });
    if (existe) return res.status(400).json({ message: "El estado ya existe" });
    const estado = await Estado.create({ nombre });
    res.status(201).json(estado);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.get("/", async (req, res) => {
  try {
    const estados = await Estado.findAll();
    console.log(estados);
    res.json(estados);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const estado = await Estado.findByPk(req.params.id);
    if (!estado) return res.status(404).json({ message: "Estado no encontrado" });
    res.json(estado);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;