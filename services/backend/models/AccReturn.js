const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AccReturn extends Model {}

	AccReturn.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
		accLoanId: {
            type: DataTypes.STRING,
            references: {
                model: 'acc_loans',
                key: 'id'
            },
        },
		count: {
			type: DataTypes.INTEGER
		},
        returnEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
            allowNull: true,
        }
	}, {
		sequelize,
		modelName: 'AccReturn'
	});
    return AccReturn;
}