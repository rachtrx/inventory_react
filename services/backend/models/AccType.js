const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('@/utils/logging.js');

module.exports = (sequelize) => {
	class AccType extends Model { }

	AccType.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		accessoryName: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
        stock: {
            type: DataTypes.INTEGER,
			allowNull: false
        },
		remarks: {
			type: DataTypes.TEXT,
		},
		addEventId: {
			type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
		},
	}, {
		sequelize,
		modelName: 'AccType'
	});
	return AccType;
}
