'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Sistemas', 'horasContrato');

    await queryInterface.addColumn('Sistemas', 'horasSoporte', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Sistemas', 'horasDesarrollo', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Sistemas', 'horasModificacion', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Sistemas', 'horasContrato', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.removeColumn('Sistemas', 'horasSoporte');
    await queryInterface.removeColumn('Sistemas', 'horasDesarrollo');
    await queryInterface.removeColumn('Sistemas', 'horasModificacion');
  }
};
