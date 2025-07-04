import Cliente from "./client.model.js";
import Sistema from "./system.model.js";
import User from "./user.model.js";
import Ticket from "./ticket.model.js";
import Comentario from "./comentario.model.js";
import SistemaUsuario from "./sistemaUsuario.model.js";

Cliente.hasMany(Sistema, { foreignKey: "clienteId" });
Sistema.belongsTo(Cliente, { foreignKey: "clienteId" });

Cliente.hasMany(User, { foreignKey: "clienteId", as: "usuarios" });
User.belongsTo(Cliente, { foreignKey: "clienteId", as: "cliente" });

Sistema.belongsToMany(User, { through: SistemaUsuario, foreignKey: "sistemaId", otherKey: "usuarioId", as: "usuarios" });
User.belongsToMany(Sistema, { through: SistemaUsuario, foreignKey: "usuarioId", otherKey: "sistemaId", as: "sistemas" });

Comentario.associate && Comentario.associate({ Ticket, User, Comentario });

export { Cliente, Sistema, User, Ticket, Comentario };
