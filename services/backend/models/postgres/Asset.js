const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../../logging.js');

module.exports = (sequelize) => {
	class Asset extends Model {

		createAssetObject = function() {
			const plainAsset = this;
			logger.info(this.get({ plain: true }));	
		
			const asset = {
				id: plainAsset.id,
				serialNumber: plainAsset.serialNumber,
				assetTag: plainAsset.assetTag,
				value: String(parseFloat(plainAsset.value)) || 'Unspecified', // removed toFixed(2) since database handles it
				bookmarked: plainAsset.bookmarked && true || false,
				variant: plainAsset.AssetTypeVariant?.variantName,
				shared: plainAsset.shared,
				assetType: plainAsset.AssetTypeVariant?.AssetType?.assetType,
				...(plainAsset.Vendor && {vendor: plainAsset.Vendor.vendorName}),
				...(plainAsset.AddEvent && {addedDate: plainAsset.AddEvent.eventDate}),
				...(plainAsset.DeleteEvent && {deletedDate: plainAsset.DeleteEvent.eventDate}),
				...(plainAsset.location && {location: plainAsset.location}),
				...(plainAsset.AssetLoans && {
					// Ongoing loan (those with loanEvent but no returnEvent)
					ongoingLoan: (() => {
						const assetLoan = plainAsset.AssetLoans.find(assetLoan => 
							!assetLoan.returnEventId && 
							!assetLoan.ReturnEvent
						);
				
						if (!assetLoan) {
							return null;  // No ongoing loan found
						}
				
						const userLoans = assetLoan.Loan.UserLoans;
						const peripheralLoans = assetLoan.Loan.PeripheralLoans;
				
						return {
							...assetLoan.Loan.createLoanObject(),
							users: userLoans.map(userLoan => userLoan.createUserLoanObject(userLoan)),
							...(assetLoan.returnEventId && { returnEventId: assetLoan.returnEventId }),
							...(assetLoan.ReturnEvent && { returnDate: assetLoan.ReturnEvent.eventDate }),
							...(peripheralLoans && {
								peripherals: peripheralLoans.map(peripheralLoan => peripheralLoan.createPeripheralLoanObject(peripheralLoan))
							}),
						};
					})(),
					reservation: (() => {
						const assetLoan = plainAsset.AssetLoans.find(assetLoan => 
							(assetLoan.reserveEventId || assetLoan.ReserveEvent) && !assetLoan.cancelEventId && !assetLoan.CancelEvent
						);
				
						if (!assetLoan) {
							return null;  // No ongoing loan found
						}
				
						const userLoans = assetLoan.Loan.UserLoans;
						const peripheralLoans = assetLoan.Loan.PeripheralLoans;
				
						return {
							...assetLoan.Loan.createLoanObject(),
							users: userLoans.map(userLoan => userLoan.createUserLoanObject(userLoan)),
							...(assetLoan.returnEventId && { returnEventId: assetLoan.returnEventId }),
							...(assetLoan.ReturnEvent && { returnDate: assetLoan.ReturnEvent.eventDate }),
							...(peripheralLoans && {
								peripherals: peripheralLoans.map(peripheralLoan => peripheralLoan.createPeripheralLoanObject(peripheralLoan))
							}),
						};
					})(),
						
					// Past loans (those with a returnEventId or ReturnEvent)
					pastLoans: plainAsset.AssetLoans
						.filter(assetLoan => assetLoan.returnEventId || assetLoan.ReturnEvent)
						.map(assetLoan => {
							const userLoans = assetLoan.Loan.UserLoans;
							const peripheralLoans = assetLoan.Loan.PeripheralLoans;
				
							return {
								...assetLoan.Loan.createLoanObject(),
								users: userLoans.map(userLoan => userLoan.createUserLoanObject(userLoan)),
								...(assetLoan.returnEventId && { returnEventId: assetLoan.returnEventId }),
								...(assetLoan.ReturnEvent && { returnDate: assetLoan.ReturnEvent.eventDate }),
								...(peripheralLoans && {
									peripherals: peripheralLoans.map(peripheralLoan => peripheralLoan.createPeripheralLoanObject(peripheralLoan))
								}),
							};
						}),
				}),
			}

			logger.info(asset);

			return asset;
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
