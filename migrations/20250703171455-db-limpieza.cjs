'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Clientes', 'apellido');
    await queryInterface.removeColumn('Clientes', 'usuarioId');

    await queryInterface.addColumn('Usuarios', 'clienteId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Clientes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.createTable('SistemaUsuarios', {
      sistemaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Sistemas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SistemaUsuarios');
    await queryInterface.removeColumn('Usuarios', 'clienteId');
    await queryInterface.addColumn('Clientes', 'apellido', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Clientes', 'usuarioId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id'
      }
    });
  }
};