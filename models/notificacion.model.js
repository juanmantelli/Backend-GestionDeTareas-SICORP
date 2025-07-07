import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Notificacion = sequelize.define("Notificacion", {
  usuarioId: { type: DataTypes.INTEGER, allowNull: false },
  ticketId: { type: DataTypes.INTEGER, allowNull: false },
  comentarioId: { type: DataTypes.INTEGER, allowNull: true },
  leido: { type: DataTypes.BOOLEAN, defaultValue: false },
  tipo: { type: DataTypes.STRING, allowNull: true },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

export default Notificacion;