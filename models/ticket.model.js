import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Cliente from "./client.model.js";
import Sistema from "./system.model.js";
import Estado from "./estado.model.js";
import Categoria from "./categoria.model.js";
import User from "./user.model.js";

const Ticket = sequelize.define("Ticket", {
  titulo: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  archivosAdjuntos: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('archivosAdjuntos');
      return raw ? JSON.parse(raw) : [];
    },
    set(val) {
      this.setDataValue('archivosAdjuntos', JSON.stringify(val));
    }
  },
  horasCargadas: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
  fechaCreacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  fechaCierre: { type: DataTypes.DATE, allowNull: true },
  tomado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  usuarioAsignado: { type: DataTypes.STRING, allowNull: true },
  prioridad: {type: DataTypes.ENUM("Alta", "Media", "Baja"),allowNull: false,defaultValue: "Media"},
  categoriaTipoId: {type: DataTypes.INTEGER, allowNull: false},
}, { timestamps: true });

Ticket.belongsTo(Cliente, { foreignKey: "clienteId" });
Ticket.belongsTo(Sistema, { foreignKey: "sistemaId" });
Ticket.belongsTo(Estado, { foreignKey: "categoriaId" });
Ticket.belongsTo(User, { foreignKey: "usuarioId" });
Ticket.belongsTo(Categoria, { foreignKey: "categoriaTipoId" });
Categoria.hasMany(Ticket, { foreignKey: "categoriaTipoId" });

Cliente.hasMany(Ticket, { foreignKey: "clienteId" });
Sistema.hasMany(Ticket, { foreignKey: "sistemaId" });
Estado.hasMany(Ticket, { foreignKey: "categoriaId" });
User.hasMany(Ticket, { foreignKey: "usuarioId" });

export default Ticket;