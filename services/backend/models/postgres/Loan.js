const logger = require('../../logging.js');
const Sequelize = require('sequelize');
const AstLoan = require('./AstLoan.js');
const UsrLoan = require('./UsrLoan.js');
const AccLoan = require('./AccLoan.js');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class Loan extends Model {

		createLoanObject = function() {

            return {
				...(this.AstLoan && {asset: this.AstLoan.createAssetLoanObject()}),
				...(this.UsrLoans && {users: this.UsrLoans.map(userLoan => userLoan.createUserLoanObject())}),
                ...(this.ReserveEvent && { reserveDate: this.ReserveEvent.eventDate }),
				...(this.reserveEventId && { reserveEventId: this.reserveEventId }),
				...(this.CancelEvent && { cancelDate: this.CancelEvent.eventDate }),
				...(this.cancelEventId && { cancelDate: this.cancelEventId }),
				...(this.LoanEvent && { loanDate: this.LoanEvent.eventDate }),
				...(this.loanEventId && { loanEventId: this.loanEventId }),
				...(this.expectedReturnDate && { expectedReturnDate: this.expectedReturnDate }),
				...(this.expectedLoanDate && { expectedLoanDate: this.expectedLoanDate }),
				// ACCESSORIES MUST BE AGGREGATED, CANNOT PASS TO OBJECT CLASS
				...(this.AccLoans && this.AccLoans.length > 0 && {
					accessories: this.aggAccessories()
				})
            }
        }

		aggAccessories = function() {
			const accessoryMap = new Map();
		
			this.AccLoans.forEach((accLoan) => {
				const accType = accLoan.AccType;
		
				if (!accessoryMap.has(accType.id)) {
					// Create a new entry if the accessory type id is not in the map
					accessoryMap.set(accType.id, {
						accessoryName: accType.accessoryName,
						loanDetails: [{
							accessoryLoanId: accLoan.id,
							...(accLoan.returnEventId && { returnEventId: accLoan.eventDate }),
							...(accLoan.ReturnEvent && { returnDate: accLoan.ReturnEvent.eventDate }),
						}],
					});
				} else {
					// Append to the existing accessorys array if accessory type already exists
					accessoryMap.get(accType.id).loanDetails.push({
						accessoryLoanId: accLoan.id,
						...(accLoan.returnEventId && { returnEventId: accLoan.eventDate }),
						...(accLoan.ReturnEvent && { returnDate: accLoan.ReturnEvent.eventDate }),
					});
				}
			});

			logger.info(accessoryMap)
		
			// Convert Map to an array, adding accessoryTypeId back into the structure dynamically
			return Array.from(accessoryMap, ([accessoryTypeId, details]) => ({
				accessoryTypeId, // Add the id back when converting to array
				...details,
			}));
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