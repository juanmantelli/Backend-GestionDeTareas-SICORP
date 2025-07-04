import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Usuario = sequelize.define("Usuario", {
  nombre: { type: DataTypes.STRING, allowNull: false },
  apellido: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.ENUM("admin", "cliente"), allowNull: false },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Clientes",
      key: "id"
    }
  }
}, {
  timestamps: true,
  tableName: "Usuarios",
});

export default Usuario;