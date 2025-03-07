import Task from "../models/task.model.js";

// Crear una tarea
export const createTask = async (req, res) => {
    const { title, description } = req.body;

    try {
        const task = await Task.create({
            title,
            description: description || "",
            user: req.user.id,
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la tarea" });
    }
};

// Obtener todas las tareas del usuario (con paginación)
export const getTasks = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const tasks = await Task.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Task.countDocuments({ user: req.user.id });

        res.json({ tasks, total, page: Number(page), totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las tareas" });
    }
};

// Actualizar una tarea (título, descripción, completada, favorita)
export const updateTask = async (req, res) => {
    const { title, description, completed, favorite } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.completed = completed !== undefined ? completed : task.completed;
        task.favorite = favorite !== undefined ? favorite : task.favorite;

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la tarea" });
    }
};

// Marcar una tarea como favorita
export const markTaskAsFavorite = async (req, res) => {
    const { favorite } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        task.favorite = favorite;
        await task.save();

        res.json({ message: `Tarea marcada como ${favorite ? "favorita" : "no favorita"}`, task });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la tarea" });
    }
};

// Eliminar una tarea por ID
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        await task.deleteOne();
        res.json({ message: "Tarea eliminada" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la tarea" });
    }
};
