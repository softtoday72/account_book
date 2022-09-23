'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
  
    await queryInterface.changeColumn('Accounts', 'price', {
      type: Sequelize.INTEGER
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Accounts', 'price', {
      type: Sequelize.STRING
    })
  }
};
