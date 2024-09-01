const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class Asset extends Model {

		createAssetObject = function() {
			const plainAsset = this.get({ plain: true });

			logger.info(plainAsset);
		
			return {
				id: plainAsset.id,
				serialNumber: plainAsset.serialNumber,
				assetTag: plainAsset.assetTag,
				status: plainAsset.deletedDate ? 'Condemned' : !plainAsset.Loan ? 'Available' : plainAsset.Loan.status === 'COMPLETED' ? 'On Loan' : 'Reserved',
				value: String(parseFloat(plainAsset.value)) || 'Unspecified', // removed toFixed(2) since database handles it
				bookmarked: plainAsset.bookmarked && true || false,
				variant: plainAsset.AssetTypeVariant?.variantName,
				assetType: plainAsset.AssetTypeVariant?.AssetType?.assetType,
				vendor: plainAsset.Vendor?.vendorName,
				...(plainAsset.addedDate && {addedDate: plainAsset.addedDate}),
				...(plainAsset.deletedDate && {deletedDate: plainAsset.deletedDate}),
				...(plainAsset.location && {location: plainAsset.location}),
				...(plainAsset.Loan && {loanId: plainAsset.Loan.id}),
				...(plainAsset.Loan?.LoanDetails && {users: (plainAsset.Loan.LoanDetails.map((loanDetails) => ({
					id: loanDetails.User.id,
					name: loanDetails.User.userName,
					bookmarked: loanDetails.User.bookmarked,
					status: loanDetails.status,
					startDate: loanDetails.startDate,
					expectedReturnDate: loanDetails.expectedReturnDate,
				})))}),
				...(plainAsset.Loan?.PeripheralLoans && {
					peripherals: plainAsset.Loan.PeripheralLoans.map((peripheralLoan) => ({
						type: peripheralLoan.peripheralType?.peripheralName,
						count: peripheralLoan.count
					}))
				}),
			}
		}
	}

	Asset.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		serialNumber: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		assetTag: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		variantId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'asset_type_variants',
				key: 'id'
			}
		},
		shared: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		bookmarked: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		leased: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		location: {
			type: DataTypes.STRING
		},
		addedDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		},
		expiryDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		vendorId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'vendors',
				key: 'id'
			}
		},
		add_event_id: {
			type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
		},
		delete_event_id: {
			type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
		},
		value: {
			type: DataTypes.NUMERIC(10, 2)
		}
	}, {
		sequelize,
		modelName: 'Asset'
	});

	Asset.beforeUpdate((instance, options) => {
		if (instance.changed('userId')) {
			const previousUserId = instance.previous('userId');
		
			if (previousUserId !== null) {
				// console.log(`Clearing userId from ${previousUserId} to null`);
				User.update({}, { where: { id: previousUserId } });
		  	}
		}
	});
	  
	Asset.afterUpdate((instance, options) => {
		if (instance.changed('userId')) {
			const newUserId = instance.get('userId');
		
			if (newUserId) {
				User.update({}, { where: { id: newUserId } });
			}
		}
	});


	return Asset;
}
