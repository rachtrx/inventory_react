const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AccLoan extends Model {

        createAccLoanObject = function() {
            return {
                ...(this.returnEventId && { returnEventId: this.eventDate }),
                ...(this.ReturnEvent && { returnDate: this.ReturnEvent.eventDate }),
                ...(this.AccLoan && { accLoanId: this.id }),
                ...(this.AccType && { accessoryName: this.AccType.accessoryName })
            }
        }
    }

	AccLoan.init({
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
        accessoryTypeId: {
            type: DataTypes.STRING,
            references: {
                model: 'acc_types',
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
		modelName: 'AccLoan',
	});

	// AccLoan.addHook('beforeUpdate', async (AccLoan, options) => {
	// 	// Check if the 'returned_date' is being updated
	// 	if (AccLoan.changed('returned_date')) {
	// 	  const accType = await AccType.findOne({
	// 		where: { id: AccLoan.peripheralTypeId },
	// 	  });
	  
	// 	  if (accType) {
	// 		accType.available += AccLoan.count;
	// 		await accType.save();
	  
	// 		console.log(`AccType with ID: ${accType.id} updated, available increased by ${AccLoan.count}`);
	// 	  }
	// 	}
	//   });
	  
	return AccLoan;
}

// untag the asset id to be able to stock transfer
  
