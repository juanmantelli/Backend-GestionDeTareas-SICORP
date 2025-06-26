import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";


const Cliente = sequelize.define("Cliente", {
  nombre: { type: DataTypes.STRING, allowNull: false },
  apellido: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id"
    }
  }
}, { timestamps: true });


export default Cliente;