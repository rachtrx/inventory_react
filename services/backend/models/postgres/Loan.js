const logger = require('../../logging.js');
const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class Loan extends Model { 

        createLoanObject = function() {
            return {
                ...(this.ReserveEvent && { reserveDate: this.ReserveEvent.eventDate }),
				...(this.reserveEventId && { reserveEventId: this.reserveEventId }),
				...(this.CancelEvent && { cancelDate: this.CancelEvent.eventDate }),
				...(this.cancelEventId && { cancelDate: this.cancelEventId }),
				...(this.LoanEvent && { loanDate: this.LoanEvent.eventDate }),
				...(this.loanEventId && { loanEventId: this.loanEventId }),
				...(this.expectedReturnDate && { expectedReturnDate: this.expectedReturnDate }),
				...(this.expectedLoanDate && { expectedLoanDate: this.expectedLoanDate })
            }
        }

    }

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