module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	const Dept = require('./Dept');
	class User extends Model {}

	User.init({
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
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
		registeredDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		},
		hasResigned: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'User',
		indexes: [{
			unique: true,
			fields: ['user_name', 'pid']
		}]
	});
	return User;
}

