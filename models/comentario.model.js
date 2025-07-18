import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Comentario = sequelize.define("Comentario", {
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  ticketId: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usuarioId: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
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
}, { timestamps: true });

Comentario.associate = (models) => {
  Comentario.belongsTo(models.Ticket, { foreignKey: "ticketId", as: "Ticket" });
  Comentario.belongsTo(models.User, { foreignKey: "usuarioId", as: "Usuario" });
  Comentario.belongsTo(models.Comentario, { as: "Padre", foreignKey: "parentId" });
  Comentario.hasMany(models.Comentario, { as: "Respuestas", foreignKey: "parentId" });
};

export default Comentario;