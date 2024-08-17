<<<<<<< HEAD
const { v4: uuidv4 } = require('uuid');

=======
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');
  class AssetType extends Model {}

  AssetType.init({
    id: {
<<<<<<< HEAD
      type: DataTypes.UUID,
			primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
=======
      type: DataTypes.STRING,
      primaryKey: true
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
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

