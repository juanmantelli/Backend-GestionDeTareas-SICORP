import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Sistema = sequelize.define("Sistema", {
  nombre: { type: DataTypes.STRING, allowNull: false },
  fechaDesde: { type: DataTypes.DATEONLY, allowNull: false }, 
  fechaHasta: { type: DataTypes.DATEONLY, allowNull: false },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Clientes",
      key: "id"
    }
  },
  horasContrato: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { timestamps: true });

export default Sistema;