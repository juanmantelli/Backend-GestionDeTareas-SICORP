import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SistemaUsuario = sequelize.define("SistemaUsuario", {
  sistemaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Sistemas",
      key: "id"
    }
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Usuarios",
      key: "id"
    }
  }
}, {
  timestamps: false,
  tableName: "SistemaUsuarios"
});

export default SistemaUsuario;