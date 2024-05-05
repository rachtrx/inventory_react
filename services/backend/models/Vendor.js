module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Vendor extends Model {}

	Vendor.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true
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
