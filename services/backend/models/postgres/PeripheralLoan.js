const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class PeripheralLoan extends Model { }

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
        userLoanId: {
            type: DataTypes.STRING,
            references: {
                model: 'user_loans',
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
        reserveEventId: {
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
        loanEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
			allowNull: false,
        },
        expectedReturnDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
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
		indexes: [
			{
				unique: true,
				fields: ['user_loan_id', 'peripheral_id']
			}
		]
	});

	// PeripheralLoan.addHook('beforeUpdate', async (peripheralLoan, options) => {
	// 	// Check if the 'returned_date' is being updated
	// 	if (peripheralLoan.changed('returned_date')) {
	// 	  const peripheralType = await PeripheralType.findOne({
	// 		where: { id: peripheralLoan.peripheralTypeId },
	// 	  });
	  
	// 	  if (peripheralType) {
	// 		peripheralType.availableCount += peripheralLoan.count;
	// 		await peripheralType.save();
	  
	// 		console.log(`PeripheralType with ID: ${peripheralType.id} updated, availableCount increased by ${peripheralLoan.count}`);
	// 	  }
	// 	}
	//   });
	  
	return PeripheralLoan;
}

// untag the asset id to be able to stock transfer
  
