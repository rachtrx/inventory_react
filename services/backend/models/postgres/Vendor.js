const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Vendor extends Model {}

	Vendor.init({
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
  			defaultValue: DataTypes.UUIDV4
		},
		vendorName: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'Vendor'
	});
	return Vendor;
}
