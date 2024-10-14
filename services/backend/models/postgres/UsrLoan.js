const logger = require('../../logging.js');
const Sequelize = require('sequelize');
const AstLoan = require('./AstLoan.js');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class UsrLoan extends Model { 

		createUserLoanObject = function() {

			return {
				...(this.Usr ? { ...this.Usr.createUserObject() } : {}),
				...(this.Loan && this.Loan.createLoanObject()),
			}
		}
	}

	UsrLoan.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		loanId: {
			type: DataTypes.STRING,
			references: {
                model: 'loans',
                key: 'id'
            },
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
	}, {
		sequelize,
		modelName: 'UsrLoan'
	});
    return UsrLoan;
}