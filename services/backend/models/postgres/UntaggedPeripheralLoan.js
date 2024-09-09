const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class UntaggedPeripheralLoan extends Model { }

    UntaggedPeripheralLoan.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        userLoanId: {
            type: DataTypes.STRING,
            references: {
                model: 'user_loans',
                key: 'id'
            },
        },
        peripheralId: {
            type: DataTypes.STRING,
            references: {
                model: 'peripherals',
                key: 'id'
            },
        },
        returnEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'UntaggedPeripheralLoan',
        indexes: [
			{
				unique: true,
				fields: ['user_loan_id', 'peripheral_id']
			}
		]
    });

    return UntaggedPeripheralLoan;
};