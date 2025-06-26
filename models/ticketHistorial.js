import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";
import Ticket from "./ticket.model.js";

const TicketHistorial = sequelize.define("TicketHistorial", {
  accion: { type: DataTypes.STRING, allowNull: false },
  estadoAnterior: { type: DataTypes.STRING },
  estadoNuevo: { type: DataTypes.STRING },
  observacion: { type: DataTypes.TEXT },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

TicketHistorial.belongsTo(User, { foreignKey: "usuarioId" });
TicketHistorial.belongsTo(Ticket, { foreignKey: "ticketId" });
TicketHistorial.belongsTo(User, { foreignKey: "usuarioAsignadoId", as: "UsuarioAsignado" });

export default TicketHistorial;