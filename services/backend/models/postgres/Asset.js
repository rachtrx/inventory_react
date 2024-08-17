const logger = require('../../logging');
<<<<<<< HEAD
const { v4: uuidv4 } = require('uuid');
=======
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Asset extends Model {

<<<<<<< HEAD
		createAssetObject = function() {
			const plainAsset = this.get({ plain: true });

			logger.info(plainAsset);
=======
		createAssetObject = function(getAge=false) {
			// console.log(this.get({ plain: true }));
			const plainAsset = this.get({ plain: true })

			logger.info(plainAsset);

			const age = getAge ? 
				Math.floor((new Date() - new Date(plainAsset.addedDate)) / (365.25 * 24 * 60 * 60 * 1000)) :
				null;
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
		
			return {
				id: plainAsset.id,
				serialNumber: plainAsset.serialNumber,
				assetTag: plainAsset.assetTag,
<<<<<<< HEAD
				status: plainAsset.deletedDate ? 'Condemned' : !plainAsset.Loan ? 'Available' : plainAsset.Loan.status === 'COMPLETED' ? 'On Loan' : 'Reserved',
=======
				status: plainAsset.User ? 'On Loan' : plainAsset.deletedDate ? 'Condemned' : 'Available',
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
				value: String(parseFloat(plainAsset.value)) || 'Unspecified', // removed toFixed(2) since database handles it
				bookmarked: plainAsset.bookmarked && true || false,
				variant: plainAsset.AssetTypeVariant?.variantName,
				assetType: plainAsset.AssetTypeVariant?.AssetType?.assetType,
				vendor: plainAsset.Vendor?.vendorName,
				...(plainAsset.addedDate && {addedDate: plainAsset.addedDate}),
				...(plainAsset.deletedDate && {deletedDate: plainAsset.deletedDate}),
				...(plainAsset.location && {location: plainAsset.location}),
<<<<<<< HEAD
				...(plainAsset.Loan && {loanId: plainAsset.Loan.id}),
				...(plainAsset.Loan?.LoanDetails && {users: (plainAsset.Loan.LoanDetails.map((loanDetails) => ({
					id: loanDetails.User.id,
					name: loanDetails.User.userName,
					bookmarked: loanDetails.User.bookmarked,
					status: loanDetails.status,
					startDate: loanDetails.startDate,
					expectedReturnDate: loanDetails.expectedReturnDate,
				})))}),
				...(plainAsset.Loan?.Peripheral && {
					peripherals: plainAsset.Loan.PeripheralLoans.map((peripheralLoan) => ({
						type: peripheralLoan.peripheralType?.peripheralName,
						count: peripheralLoan.count
					}))
				}),
=======
				...(plainAsset.User && {
					user: {
						id: plainAsset.User.id,
						name: plainAsset.User.userName,
						bookmarked: plainAsset.User.bookmarked
					}
				}),
				// For ALL Assets
				...(age && { age }),
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
			}
		}
	}

	Asset.init({
		id: {
<<<<<<< HEAD
			type: DataTypes.UUID,
			primaryKey: true,
  			defaultValue: DataTypes.UUIDV4
=======
			type: DataTypes.STRING,
			primaryKey: true
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
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
<<<<<<< HEAD
			type: DataTypes.UUID,
=======
			type: DataTypes.STRING,
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
			allowNull: false,
			references: {
				model: 'asset_type_variants',
				key: 'id'
			}
		},
<<<<<<< HEAD
		shared: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
=======
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
		bookmarked: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
<<<<<<< HEAD
=======
		userId: {
			type: DataTypes.STRING,
			allowNull: true,
			references: {
				model: 'users',
				key: 'id'
			}	
		},
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
		location: {
			type: DataTypes.STRING
		},
		addedDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		},
<<<<<<< HEAD
		expiryDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		vendorId: {
			type: DataTypes.UUID,
=======
		vendorId: {
			type: DataTypes.STRING,
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
			allowNull: false,
			references: {
				model: 'vendors',
				key: 'id'
			}
		},
		deletedDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		},
		value: {
			type: DataTypes.NUMERIC(10, 2)
		}
	}, {
		sequelize,
		modelName: 'Asset'
	});
<<<<<<< HEAD

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


=======
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
	return Asset;
}
