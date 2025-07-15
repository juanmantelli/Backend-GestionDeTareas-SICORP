import Cliente from "./client.model.js";
import Sistema from "./system.model.js";
import User from "./user.model.js";
import Ticket from "./ticket.model.js";
import Comentario from "./comentario.model.js";
import SistemaUsuario from "./sistemaUsuario.model.js";
import Notificacion from "./notificacion.model.js";
import Categoria from "./categoria.model.js";
import SistemaCategoriaHoras from "./sistemaCategoria.model.js";

Cliente.hasMany(Sistema, { foreignKey: "clienteId" });
Sistema.belongsTo(Cliente, { foreignKey: "clienteId" });

Cliente.hasMany(User, { foreignKey: "clienteId", as: "usuarios" });
User.belongsTo(Cliente, { foreignKey: "clienteId", as: "cliente" });

Sistema.belongsToMany(User, { through: SistemaUsuario, foreignKey: "sistemaId", otherKey: "usuarioId", as: "usuarios" });
User.belongsToMany(Sistema, { through: SistemaUsuario, foreignKey: "usuarioId", otherKey: "sistemaId", as: "sistemas" });

Comentario.associate && Comentario.associate({ Ticket, User, Comentario });

Notificacion.belongsTo(User, { foreignKey: "usuarioId", as: "Usuario" });
Notificacion.belongsTo(Ticket, { foreignKey: "ticketId", as: "Ticket" });
Notificacion.belongsTo(Comentario, { foreignKey: "comentarioId", as: "Comentario" });
Sistema.belongsToMany(Categoria, { through: SistemaCategoriaHoras, foreignKey: "sistemaId" });
Categoria.belongsToMany(Sistema, { through: SistemaCategoriaHoras, foreignKey: "categoriaId" });

SistemaCategoriaHoras.belongsTo(Categoria, { foreignKey: "categoriaId" });
Categoria.hasMany(SistemaCategoriaHoras, { foreignKey: "categoriaId" });

SistemaCategoriaHoras.belongsTo(Sistema, { foreignKey: "sistemaId" });
Sistema.hasMany(SistemaCategoriaHoras, { foreignKey: "sistemaId" });

export { Cliente, Sistema, User, Ticket, Comentario, Notificacion, Categoria, SistemaCategoriaHoras };
