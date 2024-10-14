const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
  class AstType extends Model {}

  AstType.init({
    id: {
      type: DataTypes.STRING,
			primaryKey: true,
    },
    typeName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AstType',
  });
  return AstType;
}

