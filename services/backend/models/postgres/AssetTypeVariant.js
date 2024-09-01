const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AssetTypeVariant extends Model {}

	AssetTypeVariant.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
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
	}, {
		sequelize,
		modelName: 'AssetTypeVariant',
	});
	return AssetTypeVariant;
}
