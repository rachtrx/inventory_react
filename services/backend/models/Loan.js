const logger = require('@/utils/logging.js');
const { Op } = require("sequelize");
const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class Loan extends Model {}

	Loan.RESERVED = "RESERVED",
	Loan.COMPLETED = "COMPLETED",
	Loan.ALL = "ALL"

	Loan.TOP_LEVEL_ON_LOAN_WHERE_CLAUSE = {
		[Op.or]: [
			Sequelize.literal(`EXISTS (
				SELECT 1 FROM ast_loans
				WHERE ast_loans.return_event_id IS NULL
				AND ast_loans.id = "AstLoan"."id"
				)`),
			Sequelize.literal(`
				"AccLoans"."id" IS NOT NULL AND NOT EXISTS (
				SELECT 1 FROM "acc_returns" AS "AccReturns"
				WHERE "AccReturns"."acc_loan_id" = "AccLoans"."id"
			)`),
			Sequelize.literal(`EXISTS (
				SELECT 1 FROM "acc_returns" AS "AccReturns"
				WHERE "AccReturns"."acc_loan_id" = "AccLoans"."id"
				GROUP BY "AccLoans"."id"
				HAVING COALESCE(SUM("AccReturns"."count"), 0) < "AccLoans"."count"
			)`)
		]
	}

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