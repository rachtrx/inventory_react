const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../../logging.js');

module.exports = (sequelize) => {
	class Ast extends Model {

		createAssetObject = function() {
			const plainAsset = this;
			logger.info(this.get({ plain: true }));	
		
			const asset = {
				assetId: plainAsset.id,
				serialNumber: plainAsset.serialNumber,
				assetTag: plainAsset.assetTag,
				value: String(parseFloat(plainAsset.value)) || 'Unspecified', // removed toFixed(2) since database handles it
				bookmarked: plainAsset.bookmarked && true || false,
				typeName: plainAsset.AstSType?.AstType?.typeName,
				subTypeName: plainAsset.AstSType?.subTypeName,
				shared: plainAsset.shared,
				...(plainAsset.Vendor && {vendor: plainAsset.Vendor.vendorName}),
				...(plainAsset.AddEvent && {addedDate: plainAsset.AddEvent.eventDate}),
				...(plainAsset.DeleteEvent && {deletedDate: plainAsset.DeleteEvent.eventDate}),
				...(plainAsset.location && {location: plainAsset.location}),
				...(plainAsset.AstLoans && {
					// Ongoing loan (those with loanEvent but no returnEvent)
					ongoingLoan: (() => {
						const astLoan = plainAsset.AstLoans.find(astLoan => 
							!astLoan.returnEventId && 
							!astLoan.ReturnEvent
						);
				
						if (!astLoan) {
							return null;  // No ongoing loan found
						}
				
						return {
							...astLoan.Loan.createLoanObject(),
							...(astLoan.returnEventId && { returnEventId: astLoan.returnEventId }),
							...(astLoan.ReturnEvent && { returnDate: astLoan.ReturnEvent.eventDate }),
						};
					})(),
					reservation: (() => {
						const astLoan = plainAsset.AstLoans.find(astLoan => 
							(astLoan.reserveEventId || astLoan.ReserveEvent) && !astLoan.cancelEventId && !astLoan.CancelEvent
						);
				
						if (!astLoan) {
							return null;  // No ongoing loan found
						}
				
						return {
							...astLoan.Loan.createLoanObject(),
							...(astLoan.returnEventId && { returnEventId: astLoan.returnEventId }),
							...(astLoan.ReturnEvent && { returnDate: astLoan.ReturnEvent.eventDate }),
						};
					})(),
						
					// Past loans (those with a returnEventId or ReturnEvent)
					pastLoans: plainAsset.AstLoans
						.filter(astLoan => astLoan.returnEventId || astLoan.ReturnEvent)
						.map(astLoan => {
							return {
								...astLoan.Loan.createLoanObject(),
								...(astLoan.returnEventId && { returnEventId: astLoan.returnEventId }),
								...(astLoan.ReturnEvent && { returnDate: astLoan.ReturnEvent.eventDate }),
							};
						}),
				}),
			}

			logger.info(asset);

			return asset;
		}
	}

	Ast.init({
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
		subTypeId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'ast_s_types',
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
		addEventId: {
			type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
		},
		delEventId: {
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
		modelName: 'Ast'
	});

	Ast.beforeUpdate((instance, options) => {
		if (instance.changed('userId')) {
			const previousUserId = instance.previous('userId');
		
			if (previousUserId !== null) {
				// console.log(`Clearing userId from ${previousUserId} to null`);
				Usr.update({}, { where: { id: previousUserId } });
		  	}
		}
	});
	  
	Ast.afterUpdate((instance, options) => {
		if (instance.changed('userId')) {
			const newUserId = instance.get('userId');
		
			if (newUserId) {
				Usr.update({}, { where: { id: newUserId } });
			}
		}
	});


	return Ast;
}
