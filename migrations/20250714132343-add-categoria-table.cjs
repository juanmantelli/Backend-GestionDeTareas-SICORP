'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('Categoria', 'Estado');

    await queryInterface.createTable('Categoria', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.removeColumn('Tickets', 'categoriaTipo');

    await queryInterface.addColumn('Tickets', 'categoriaTipoId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addConstraint('Tickets', {
      fields: ['categoriaTipoId'],
      type: 'foreign key',
      name: 'fk_tickets_categoriaTipoId',
      references: {
        table: 'Categoria',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Tickets', 'fk_tickets_categoriaTipoId');

    await queryInterface.removeColumn('Tickets', 'categoriaTipoId');

    await queryInterface.dropTable('Categoria');

    await queryInterface.renameTable('Estado', 'Categoria');
  }
};