import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ClienteSistema = sequelize.define("ClienteSistema", {
  clienteId: {
    type: DataTypes.INTEGER,
    references: { model: "Clientes", key: "id" }
  },
  sistemaId: {
    type: DataTypes.INTEGER,
    references: { model: "Sistemas", key: "id" }
  }
}, { timestamps: false });

export default ClienteSistema;