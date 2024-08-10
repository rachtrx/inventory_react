module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class AssetTypePeripheral extends Model {}

	AssetTypePeripheral.init({
		peripheralTypeId: {
			type: DataTypes.UUID,
			primaryKey: true,
			references: {
				model: 'peripheral_types',
				key: 'id'
			}
		},
		assetTypeId: {
			type: DataTypes.UUID,
			primaryKey: true,
			references: {
				model: 'asset_types',
				key: 'id'
			}
		},
	}, {
		sequelize,
		modelName: 'AssetTypePeripheral',
	});
	return AssetTypePeripheral;
}