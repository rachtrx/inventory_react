const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class AssetTypeVariant extends Model {}

	AssetTypeVariant.init({
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
  			defaultValue: DataTypes.UUIDV4,
		},
		assetTypeId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: 'asset_types',
				key: 'id'
			}
		},
		variantName: {
			type: DataTypes.STRING,
			allowNull: false
		},
	}, {
		sequelize,
		modelName: 'AssetTypeVariant',
	});
	return AssetTypeVariant;
}
