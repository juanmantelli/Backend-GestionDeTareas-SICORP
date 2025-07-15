import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Estado = sequelize.define("Estado", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, { timestamps: true });

export default Estado;