'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Notificacions', 'comentarioId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Comentarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Notificacions', 'comentarioId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'Comentarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};