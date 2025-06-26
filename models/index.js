import Cliente from "./client.model.js";
import Sistema from "./system.model.js";
import ClienteSistema from "./clienteSistema.model.js";
import User from "./user.model.js";
import Ticket from "./ticket.model.js";
import Comentario from "./comentario.model.js";


Cliente.belongsToMany(Sistema, { through: ClienteSistema, foreignKey: "clienteId" });
Sistema.belongsToMany(Cliente, { through: ClienteSistema, foreignKey: "sistemaId" });

Cliente.belongsTo(User, { foreignKey: "usuarioId", as: "usuario" });

Comentario.associate && Comentario.associate({ Ticket, User, Comentario });

export { Cliente, Sistema, ClienteSistema, User, Ticket, Comentario };
