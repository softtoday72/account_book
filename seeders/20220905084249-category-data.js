'use strict';

const category_seed = [
  { name: '飲食' },
  { name: '交通' },
  { name: '超市' },
  { name: '帳單' },
  { name: '其他' },
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Categories', [ '飲食', '交通', '超市', '帳單', '其他' ].map(item => {
      return {
        name: item,
        created_at: new Date(),
        updated_at: new Date()
      }
    }), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {})
  }
};
