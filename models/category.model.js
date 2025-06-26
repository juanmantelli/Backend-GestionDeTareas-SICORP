import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Categoria = sequelize.define("Categoria", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, { timestamps: true });

export default Categoria;