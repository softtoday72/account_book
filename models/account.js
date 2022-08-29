'use strict';
module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    name: DataTypes.STRING,
    price: DataTypes.STRING,
    category_id: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER
  }, {
    underscored: true,
  });
  Account.associate = function(models) {
    // associations can be defined here
  };
  return Account;
};