import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Cliente = sequelize.define("Cliente", {
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true }
}, { timestamps: true });

export default Cliente;