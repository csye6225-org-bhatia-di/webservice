'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserToImageMapping extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserToImageMapping.init({
    userID: {
      type: Sequelize.UUID,
      allowNull: false
   },
    imageKey: {
      type: Sequelize.UUID,
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
  }, {
    sequelize,
    modelName: 'usertoimagemapping',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: true
  });
  return UserToImageMapping;
};