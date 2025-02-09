const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
  class UsrTag extends Model {}

  UsrTag.init({
    id: {
      type: DataTypes.STRING,
            primaryKey: true,
    },
    tagName: {
      type: DataTypes.STRING,
      allowNull: false,
            unique: true
    },
    hex: {
      type: DataTypes.STRING,
      defaultValue: '#808080',
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UsrTag',
  });
  return UsrTag;
}

