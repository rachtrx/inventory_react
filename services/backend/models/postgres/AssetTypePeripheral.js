const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AssetTypePeripheral extends Model {}

	AssetTypePeripheral.init({
		peripheralTypeId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: 'peripheral_types',
				key: 'id'
			}
		},
		assetTypeId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: 'asset_types',
				key: 'id'
			}
		},
        totalHits: {
            type: DataTypes.INTEGER,
		},
		consecutiveHits: {
            type: DataTypes.INTEGER,
		},
		consecutiveMisses: {
            type: DataTypes.INTEGER,
		}
	}, {
		sequelize,
		modelName: 'AssetTypePeripheral',
	});
	return AssetTypePeripheral;
}