const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class TaggedPeripheralLoan extends Model { }

	TaggedPeripheralLoan.init({
		id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        assetLoanId: {
            type: DataTypes.STRING,
            references: {
                model: 'asset_loans',
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
		modelName: 'TaggedPeripheralLoan',
	});

	// TaggedPeripheralLoan.addHook('beforeUpdate', async (TaggedPeripheralLoan, options) => {
	// 	// Check if the 'returned_date' is being updated
	// 	if (TaggedPeripheralLoan.changed('returned_date')) {
	// 	  const peripheralType = await PeripheralType.findOne({
	// 		where: { id: TaggedPeripheralLoan.peripheralTypeId },
	// 	  });
	  
	// 	  if (peripheralType) {
	// 		peripheralType.availableCount += TaggedPeripheralLoan.count;
	// 		await peripheralType.save();
	  
	// 		console.log(`PeripheralType with ID: ${peripheralType.id} updated, availableCount increased by ${TaggedPeripheralLoan.count}`);
	// 	  }
	// 	}
	//   });
	  
	return TaggedPeripheralLoan;
}

// untag the asset id to be able to stock transfer
  
