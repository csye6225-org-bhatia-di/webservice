'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
  },

  first_name: {
      type: Sequelize.STRING,
      allowNull: false
  },

  last_name: {
      type: Sequelize.STRING,
      allowNull: false
  },

  username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
  },

  password: {
      type: Sequelize.STRING,
      allowNull: false
  },
  created_at: {
    timestamp: true,
    allowNull: false,
    type: Sequelize.DATE
  },
  updated_at: {
    timestamp: true,
    allowNull: false,
    type: Sequelize.DATE
  }

  }, 
 {
    sequelize,
    modelName: 'user',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: true
   
  });
  return User;
};