module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Event extends Model {}

	Event.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		assetId: {
			type: DataTypes.STRING,
			allowNull: true,
			references: {
				model: 'assets', // IMPT ACTUAL DATABASE NAME
				key: 'id'
			}
		},
		eventType: {
			type: DataTypes.STRING,
			allowNull: false
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: true,
			references: {
				model: 'users',
				key: 'id'
			}
		},
		remarks: {
			type: DataTypes.TEXT
		},
		eventDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		},
		filepath: {
			type: DataTypes.STRING
		}
	}, {
		sequelize,
		modelName: 'Event',
	});
	return Event;
}
