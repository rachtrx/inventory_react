const logger = require('../logging.js');
const Sequelize = require('sequelize');
const AstLoan = require('./AstLoan.js');
const UsrLoan = require('./UsrLoan.js');
const AccLoan = require('./AccLoan.js');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class Loan extends Model {}

	Loan.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		reserveEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
			allowNull: true,
        },
        cancelEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
			allowNull: true,
        },
        expectedLoanDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		},
		expectedReturnDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		},
		loanEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
			allowNull: true,
        },
	}, {
		sequelize,
		modelName: 'Loan'
	});
    return Loan;
}