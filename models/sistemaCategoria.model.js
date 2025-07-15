import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Sistema from "./system.model.js";
import Categoria from "./categoria.model.js";

const SistemaCategoriaHoras = sequelize.define("SistemaCategoriaHoras", {
  sistemaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Sistemas", key: "id" }
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Categoria", key: "id" }
  },
  horasContratadas: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { timestamps: false });

Sistema.belongsToMany(Categoria, { through: SistemaCategoriaHoras, foreignKey: "sistemaId" });
Categoria.belongsToMany(Sistema, { through: SistemaCategoriaHoras, foreignKey: "categoriaId" });

export default SistemaCategoriaHoras;