module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class VariantPeripheral extends Model {}

	VariantPeripheral.init({
		peripheralTypeId: {
			type: DataTypes.UUID,
			primaryKey: true,
			references: {
				model: 'peripheral_types',
				key: 'id'
			}
		},
		variantId: {
			type: DataTypes.UUID,
			primaryKey: true,
			references: {
				model: 'asset_type_variants',
				key: 'id'
			}
		},
	}, {
		sequelize,
		modelName: 'VariantPeripheral',
	});
	return VariantPeripheral;
}
