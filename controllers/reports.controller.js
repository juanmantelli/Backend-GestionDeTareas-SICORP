import Ticket from "../models/ticket.model.js";
import Cliente from "../models/client.model.js";
import { Sequelize } from "sequelize";

export const horasPorCliente = async (req, res) => {
  try {
    const resultados = await Ticket.findAll({
      attributes: [
        "clienteId",
        [Sequelize.fn("SUM", Sequelize.col("horasCargadas")), "totalHoras"]
      ],
      include: [{ model: Cliente, attributes: ["nombre", "email"] }],
      group: ["clienteId", "Cliente.id"]
    });

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};