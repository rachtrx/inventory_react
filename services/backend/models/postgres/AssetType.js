const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
  class AssetType extends Model {}

  AssetType.init({
    id: {
      type: DataTypes.STRING,
			primaryKey: true,
    },
    assetType: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AssetType',
  });
  return AssetType;
}

