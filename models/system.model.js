import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";


const Sistema = sequelize.define("Sistema", {
  nombre: { type: DataTypes.STRING, allowNull: false },
  horasContrato: { type: DataTypes.INTEGER, allowNull: false },
  fechaDesde: { type: DataTypes.DATEONLY, allowNull: false }, 
  fechaHasta: { type: DataTypes.DATEONLY, allowNull: false }  
}, { timestamps: true });


export default Sistema;