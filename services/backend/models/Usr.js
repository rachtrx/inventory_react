const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../logging.js');

module.exports = (sequelize) => {
	class Usr extends Model {}

	Usr.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		userName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		pid: {
			type: DataTypes.STRING,
			allowNull: true
		},
		deptId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'depts',
				key: 'id'
			}
		},
		bookmarked: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		addEventId: {
			type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
		},
		delEventId: {
			type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
		},
	}, {
		sequelize,
		modelName: 'Usr',
		indexes: [{
			unique: true,
			fields: ['user_name', 'pid']
		}]
	});
	return Usr;
}

