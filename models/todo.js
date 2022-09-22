'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User, { foreignKey: 'userId' })
    }
  };
  Todo.init({
    name: DataTypes.STRING,
    is_done: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER

  }, {
    sequelize,
    modelName: 'Todo',
    tableName: 'Todos',
    underscored: true
  })
  return Todo
}