const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../../logging.js');

module.exports = (sequelize) => {
	class AccTxn extends Model { }

	AccTxn.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		accessoryTypeId: {
			type: DataTypes.STRING,
			allowNull: false,
            references: {
                model: 'acc_types',
                key: 'id',
            },
		},
        txn: {
            type: DataTypes.INTEGER,
			allowNull: false
        },
        txnEventId: {
            type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
        }
	}, {
		sequelize,
		modelName: 'AccTxn'
	});
	return AccTxn;
}
