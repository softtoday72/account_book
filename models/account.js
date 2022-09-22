'use strict';
module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    name: DataTypes.STRING,
    price: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    date: DataTypes.DATE
  }, {
    underscored: true,
    tableName: 'Accounts'
  });
  Account.associate = function(models) {
    Account.belongsTo(models.User, { foreignKey: 'userId' })
    Account.belongsTo(models.Category, { foreignKey: 'categoryId' })
  };
  return Account;
};

const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Account.belongsTo(models.User, { foreignKey: 'userId' })
      Account.belongsTo(models.Category, { foreignKey: 'categoryId' })
    }
  };
  Account.init({
    name: DataTypes.STRING,
    price: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Account',
    tableName: 'Accounts',
    underscored: true
  })
  return Account
}