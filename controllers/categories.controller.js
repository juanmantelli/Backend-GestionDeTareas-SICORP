import Estado from "../models/estado.model.js";

export const createCategoria = async (req, res) => {
  const { nombre } = req.body;
  try {
    const existe = await Estado.findOne({ where: { nombre } });
    if (existe) return res.status(400).json({ message: "La categoría ya existe" });
    const categoria = await Estado.create({ nombre });
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getCategorias = async (req, res) => {
  try {
    const estados = await Estado.findAll();
    console.log(estados);
    res.json(estados);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getCategoriaById = async (req, res) => {
  try {
    const estados = await Estado.findByPk(req.params.id);
    if (!estados) return res.status(404).json({ message: "Categoría no encontrada" });
    res.json(estados);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const updateCategoria = async (req, res) => {
  const { nombre } = req.body;
  try {
    const categoria = await Estado.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ message: "Categoría no encontrada" });
    await categoria.update({ nombre });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const deleteCategoria = async (req, res) => {
  try {
    const categoria = await Estado.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ message: "Categoría no encontrada" });
    await categoria.destroy();
    res.json({ message: "Categoría eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};