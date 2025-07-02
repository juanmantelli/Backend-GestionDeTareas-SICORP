import Cliente from "./client.model.js";
import Sistema from "./system.model.js";
import User from "./user.model.js";
import Ticket from "./ticket.model.js";
import Comentario from "./comentario.model.js";

Cliente.hasMany(Sistema, { foreignKey: "clienteId" });
Sistema.belongsTo(Cliente, { foreignKey: "clienteId" });

Cliente.belongsTo(User, { foreignKey: "usuarioId", as: "usuario" });

Comentario.associate && Comentario.associate({ Ticket, User, Comentario });

export { Cliente, Sistema, User, Ticket, Comentario };
