const logger = require('../../logging');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Asset extends Model {

		createAssetObject = function(getAge=false) {
			// console.log(this.get({ plain: true }));
			const plainAsset = this.get({ plain: true })

			logger.info(plainAsset);

			const age = getAge ? 
				Math.floor((new Date() - new Date(plainAsset.addedDate)) / (365.25 * 24 * 60 * 60 * 1000)) :
				null;
		
			return {
				id: plainAsset.id,
				serialNumber: plainAsset.serialNumber,
				assetTag: plainAsset.assetTag,
				status: plainAsset.User ? 'On Loan' : plainAsset.deletedDate ? 'Condemned' : 'Available',
				value: String(parseFloat(plainAsset.value)) || 'Unspecified', // removed toFixed(2) since database handles it
				bookmarked: plainAsset.bookmarked && true || false,
				variant: plainAsset.AssetTypeVariant?.variantName,
				assetType: plainAsset.AssetTypeVariant?.AssetType?.assetType,
				vendor: plainAsset.Vendor?.vendorName,
				...(plainAsset.addedDate && {addedDate: plainAsset.addedDate}),
				...(plainAsset.deletedDate && {deletedDate: plainAsset.deletedDate}),
				...(plainAsset.location && {location: plainAsset.location}),
				...(plainAsset.User && {
					user: {
						id: plainAsset.User.id,
						name: plainAsset.User.userName,
						bookmarked: plainAsset.User.bookmarked
					}
				}),
				// For ALL Assets
				...(age && { age }),
			}
		}
	}

	Asset.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true
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
		bookmarked: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: true,
			references: {
				model: 'users',
				key: 'id'
			}	
		},
		location: {
			type: DataTypes.STRING
		},
		addedDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		},
		vendorId: {
			type: DataTypes.STRING,
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
