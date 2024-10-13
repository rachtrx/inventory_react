const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class PeripheralLoan extends Model {

        createperipheralLoanObject = function() {
            return {
                ...(this.returnEventId && { returnEventId: this.eventDate }),
                ...(this.ReturnEvent && { returnDate: this.ReturnEvent.eventDate }),
                ...(this.Peripheral && {
                    peripheralId: this.Peripheral.id,
                    peripheralName: this.Peripheral.PeripheralType.name,
                })
            }
        }
    }

	PeripheralLoan.init({
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
		modelName: 'PeripheralLoan',
	});

	// PeripheralLoan.addHook('beforeUpdate', async (PeripheralLoan, options) => {
	// 	// Check if the 'returned_date' is being updated
	// 	if (PeripheralLoan.changed('returned_date')) {
	// 	  const peripheralType = await PeripheralType.findOne({
	// 		where: { id: PeripheralLoan.peripheralTypeId },
	// 	  });
	  
	// 	  if (peripheralType) {
	// 		peripheralType.availableCount += PeripheralLoan.count;
	// 		await peripheralType.save();
	  
	// 		console.log(`PeripheralType with ID: ${peripheralType.id} updated, availableCount increased by ${PeripheralLoan.count}`);
	// 	  }
	// 	}
	//   });
	  
	return PeripheralLoan;
}

// untag the asset id to be able to stock transfer
  
