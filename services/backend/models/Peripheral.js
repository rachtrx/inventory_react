module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Peripherals extends Model {}

	Peripherals.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
        userId: {
            allowNull: false,
			references: {
				model: 'admin',
				key: 'id'
			}
        },
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
        favourite: {
            type: DataTypes.INTEGER,
			allowNull: false
        }
	}, {
		sequelize,
		modelName: 'Peripheral'
	});
	return Peripherals;
}
