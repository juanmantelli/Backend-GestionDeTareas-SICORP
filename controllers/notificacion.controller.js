import Notificacion from "../models/notificacion.model.js";
import Comentario from "../models/comentario.model.js";
import Ticket from "../models/ticket.model.js";

export const getNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.findAll({
      where: { usuarioId: req.user.id, leido: false },
      include: [
        { model: Comentario, as: "Comentario" },
        { model: Ticket, as: "Ticket" }
      ],
      order: [["fecha", "DESC"]]
    });
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
};

export const marcarNotificacionesLeidas = async (req, res) => {
  try {
    await Notificacion.update(
      { leido: true },
      { where: { usuarioId: req.user.id, leido: false } }
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: "Error al marcar notificaciones" });
  }
};

export const marcarNotificacionLeida = async (req, res) => {
  try {
    const { id } = req.params;
    await Notificacion.update(
      { leido: true },
      { where: { id, usuarioId: req.user.id } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al marcar notificación como leída" });
  }
};