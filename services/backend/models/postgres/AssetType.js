const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');
  class AssetType extends Model {}

  AssetType.init({
    id: {
      type: DataTypes.UUID,
			primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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

