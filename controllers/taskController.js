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
    const { page = 1, limit = 10, filter } = req.query;
    let query = { user: req.user.id };

    switch (filter) {
        case 'favorites':
            query.favorite = true;
            break;
        case 'completed':
            query.completed = true;
            break;
        case 'incomplete':
            query.completed = false;
            break;
        default:
            break;
    }

    try {
        const tasks = await Task.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Task.countDocuments(query);

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

export const completedTask = async (req, res) => {
    const { completed } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }
        task.completed = completed;
        await task.save();

        res.json({ message: "Tarea actualizada", task }); // Enviar respuesta al cliente
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la tarea" });
    }
};
