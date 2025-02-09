const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
  class AstTag extends Model {}

  AstTag.init({
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
    modelName: 'AstTag',
  });
  return AstTag;
}

