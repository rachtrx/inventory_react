const logger = require('../../logging.js');
const Sequelize = require('sequelize');
const AssetLoan = require('./AssetLoan.js');
const UserLoan = require('./UserLoan.js');
const PeripheralLoan = require('./PeripheralLoan.js');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class Loan extends Model {

		createLoanObject = function() {

            return {
				...(this.AssetLoan && {asset: this.AssetLoan.createAssetLoanObject()}),
				...(this.UserLoans && {users: this.UserLoans.map(userLoan => userLoan.createUserLoanObject())}),
                ...(this.ReserveEvent && { reserveDate: this.ReserveEvent.eventDate }),
				...(this.reserveEventId && { reserveEventId: this.reserveEventId }),
				...(this.CancelEvent && { cancelDate: this.CancelEvent.eventDate }),
				...(this.cancelEventId && { cancelDate: this.cancelEventId }),
				...(this.LoanEvent && { loanDate: this.LoanEvent.eventDate }),
				...(this.loanEventId && { loanEventId: this.loanEventId }),
				...(this.expectedReturnDate && { expectedReturnDate: this.expectedReturnDate }),
				...(this.expectedLoanDate && { expectedLoanDate: this.expectedLoanDate }),
				// PERIPHERALS MUST BE AGGREGATED, CANNOT PASS TO OBJECT CLASS
				...(this.PeripheralLoans && this.PeripheralLoans.length > 0 && {
					peripherals: this.aggPeripherals()
				})
            }
        }

		aggPeripherals = function() {
			const peripheralMap = new Map();
		
			this.PeripheralLoans.forEach((peripheralLoan) => {
				const peripheral = peripheralLoan.Peripheral;
				const peripheralTypeId = peripheral.PeripheralType.id;
				logger.info(peripheral.PeripheralType.name)
		
				if (!peripheralMap.has(peripheralTypeId)) {
					// Create a new entry if the peripheral type id is not in the map
					peripheralMap.set(peripheralTypeId, {
						peripheralName: peripheral.PeripheralType.name,
						peripherals: [{
							peripheralId: peripheral.id,
							...(peripheralLoan.returnEventId && { returnEventId: peripheralLoan.eventDate }),
							...(peripheralLoan.ReturnEvent && { returnDate: peripheralLoan.ReturnEvent.eventDate }),
						}],
					});
				} else {
					// Append to the existing peripherals array if peripheral type already exists
					peripheralMap.get(peripheralTypeId).peripherals.push({
						peripheralId: peripheral.id,
						...(peripheralLoan.returnEventId && { returnEventId: peripheralLoan.eventDate }),
						...(peripheralLoan.ReturnEvent && { returnDate: peripheralLoan.ReturnEvent.eventDate }),
					});
				}
			});

			logger.info(peripheralMap)
		
			// Convert Map to an array, adding peripheralTypeId back into the structure dynamically
			return Array.from(peripheralMap, ([peripheralTypeId, details]) => ({
				peripheralTypeId, // Add the id back when converting to array
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