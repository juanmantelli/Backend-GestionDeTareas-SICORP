'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Notificacions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ticketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Tickets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      comentarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Comentarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      leido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Notificacions');
  }
};
