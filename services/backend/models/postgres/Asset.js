const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../../logging.js');

module.exports = (sequelize) => {
	class Asset extends Model {

		createAssetObject = function() {
			const plainAsset = this.get({ plain: true });

			logger.info(plainAsset);
		
			return {
				id: plainAsset.id,
				serialNumber: plainAsset.serialNumber,
				assetTag: plainAsset.assetTag,
				value: String(parseFloat(plainAsset.value)) || 'Unspecified', // removed toFixed(2) since database handles it
				bookmarked: plainAsset.bookmarked && true || false,
				variant: plainAsset.AssetTypeVariant?.variantName,
				shared: plainAsset.shared,
				assetType: plainAsset.AssetTypeVariant?.AssetType?.assetType,
				vendor: plainAsset.Vendor?.vendorName,
				...(plainAsset.AddEvent && {addedDate: plainAsset.AddEvent.eventDate}),
				...(plainAsset.DeleteEvent && {deletedDate: plainAsset.DeleteEvent.eventDate}),
				...(plainAsset.location && {location: plainAsset.location}),
				...(plainAsset.AssetLoans && plainAsset.AssetLoans.length > 0 && {users: (plainAsset.AssetLoans.map((assetLoan) => ({
					id: assetLoan.UserLoan.User.id,
					userName: assetLoan.UserLoan.User.userName,
					bookmarked: assetLoan.UserLoan.User.bookmarked,
					...(assetLoan.UserLoan.ReserveEvent && { reserveDate: assetLoan.UserLoan.ReserveEvent.eventDate }),
					...(assetLoan.UserLoan.reserveEventId && { reserveEventId: assetLoan.UserLoan.reserveEventId }),
					...(assetLoan.UserLoan.CancelEvent && { cancelDate: assetLoan.UserLoan.CancelEvent.eventDate }),
					...(assetLoan.UserLoan.cancelEventId && { cancelDate: assetLoan.UserLoan.cancelEventId }),
					...(assetLoan.UserLoan.LoanEvent && { loanDate: assetLoan.UserLoan.LoanEvent.eventDate }),
					...(assetLoan.UserLoan.expectedReturnDate && { expectedReturnDate: assetLoan.UserLoan.expectedReturnDate }),
					...(assetLoan.UserLoan.expectedLoanDate && { expectedLoanDate: assetLoan.UserLoan.expectedLoanDate }),
					...(assetLoan.UserLoan.loanEventId && { loanEventId: assetLoan.UserLoan.loanEventId }),
					...(assetLoan.returnEventId && { returnEventId: assetLoan.returnEventId }),
					...(assetLoan.ReturnEvent && { returnDate: assetLoan.ReturnEvent.eventDate }),
				})))}),
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
