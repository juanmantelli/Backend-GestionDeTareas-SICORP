'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('Sistemas', 'horasSoporte').catch(() => {}),
      queryInterface.removeColumn('Sistemas', 'horasDesarrollo').catch(() => {}),
      queryInterface.removeColumn('Sistemas', 'horasModificacion').catch(() => {})
    ]);

    await queryInterface.createTable('SistemaCategoriaHoras', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      sistemaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Sistemas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      categoriaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Categoria', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      horasContratadas: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SistemaCategoriaHoras');

    await queryInterface.addColumn('Sistemas', 'horasSoporte', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('Sistemas', 'horasDesarrollo', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('Sistemas', 'horasModificacion', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};