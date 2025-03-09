const logger = require('../logging.js');
const Sequelize = require('sequelize');
const AstLoan = require('./AstLoan.js');
const AccLoan = require('./AccLoan.js');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class Loan extends Model {}

	Loan.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.STRING,
			references: {
                model: 'usrs',
                key: 'id'
            },
		},
		filepath: {
			type: DataTypes.STRING,
			allowNull: true,
		},
        expectedLoanDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		},
		expectedReturnDate: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: null
		},
		reserveEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
			allowNull: true,
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
		modelName: 'Loan',
		validate: {
			atLeastOneEventId() {
				if (!this.reserveEventId && !this.loanEventId) {
					throw new Error('At least one of loanEventId, or reserveEventId must not be null.');
				}
			}
		}
	});
    return Loan;
}