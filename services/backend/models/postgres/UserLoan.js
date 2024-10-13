const logger = require('../../logging.js');
const Sequelize = require('sequelize');
const AssetLoan = require('./AssetLoan.js');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class UserLoan extends Model { 

		createUserLoanObject = function() {

			return {
				...(this.User ? { ...this.User.createUserObject() } : {}),
				...(this.Loan && this.Loan.createLoanObject()),
			}
		}
	}

	UserLoan.init({
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
                model: 'users',
                key: 'id'
            },
		},
		filepath: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	}, {
		sequelize,
		modelName: 'UserLoan'
	});
    return UserLoan;
}