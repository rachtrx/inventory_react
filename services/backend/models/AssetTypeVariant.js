module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class AssetTypeVariant extends Model {}

	AssetTypeVariant.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		assetTypeId: {
			type: DataTypes.STRING,
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
		// addedDate: {
		// 	type: DataTypes.DATE,
		// 	defaultValue: DataTypes.NOW
		// }
	}, {
		sequelize,
		modelName: 'AssetTypeVariant',
	});
	return AssetTypeVariant;
}
