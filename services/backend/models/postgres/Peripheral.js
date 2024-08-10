const logger = require('../../logging');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Peripheral extends Model { }

	Peripheral.init({
		loanId: {
			type: DataTypes.UUID,
			primaryKey: true,
			references: {
				model: 'loans',
				key: 'id'
			}
		},
		peripheralTypeId: {
			type: DataTypes.UUID,
			references: {
				model: 'peripheral_types',
				key: 'id'
			}
		},
		count: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'Peripheral'
	});
	return Peripheral;
}

// untag the asset id to be able to stock transfer
  