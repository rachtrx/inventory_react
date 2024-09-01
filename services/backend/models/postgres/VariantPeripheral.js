const logger = require('../../logging.js');
const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class VariantPeripheral extends Model {}

	VariantPeripheral.init({
		peripheralTypeId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: 'peripheral_types',
				key: 'id'
			}
		},
		variantId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: 'asset_type_variants',
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
		modelName: 'VariantPeripheral',
	});
	return VariantPeripheral;
}
