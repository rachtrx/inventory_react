const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../logging.js');

module.exports = (sequelize) => {
	class Ast extends Model {}

	Ast.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		serialNumber: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		alias: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true
		},
		subTypeId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'ast_s_types',
				key: 'id'
			}
		},
		bookmarked: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		location: {
			type: DataTypes.STRING
		},
		remarks: {
			type: DataTypes.TEXT,
		},
		leaseEndDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		vendorId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'vendors',
				key: 'id'
			}
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
		value: {
			type: DataTypes.NUMERIC(10, 2)
		}
	}, {
		sequelize,
		modelName: 'Ast'
	});

	Ast.beforeUpdate((instance, options) => {
		if (instance.changed('userId')) {
			const previousUserId = instance.previous('userId');
		
			if (previousUserId !== null) {
				// console.log(`Clearing userId from ${previousUserId} to null`);
				Usr.update({}, { where: { id: previousUserId } });
		  	}
		}
	});
	  
	Ast.afterUpdate((instance, options) => {
		if (instance.changed('userId')) {
			const newUserId = instance.get('userId');
		
			if (newUserId) {
				Usr.update({}, { where: { id: newUserId } });
			}
		}
	});


	return Ast;
}
