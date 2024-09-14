const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../../logging.js');

module.exports = (sequelize) => {
	class User extends Model {

		createUserObject = function() {
			const plainUser = this.get({ plain: true })
			logger.info(plainUser);

			return {
				id: plainUser.id,
				userName: plainUser.userName,
				bookmarked: plainUser.bookmarked && true || false,
				department: plainUser.Department.deptName,
				...(plainUser.AddEvent && {addedDate: plainUser.AddEvent.eventDate}),
				...(plainUser.DeleteEvent && {deletedDate: plainUser.DeleteEvent.eventDate}),
				...plainUser.UserLoans && {loans: (plainUser.UserLoans.map((userLoan) => 
					({
						...(userLoan.ReserveEvent && { reserveDate: userLoan.ReserveEvent.eventDate }),
						...(userLoan.reserveEventId && { reserveEventId: userLoan.reserveEventId }),
						...(userLoan.CancelEvent && { cancelDate: userLoan.CancelEvent.eventDate }),
						...(userLoan.cancelEventId && { cancelDate: userLoan.cancelEventId }),
						...(userLoan.expectedLoanDate && { expectedLoanDate: userLoan.expectedLoanDate }),
						...(userLoan.loanEventId && { loanEventId: userLoan.loanEventId }),
						...(userLoan.LoanEvent && { loanDate: userLoan.LoanEvent.eventDate }),
						...(userLoan.expectedReturnDate && { expectedReturnDate: userLoan.expectedReturnDate }),
						...(userLoan.AssetLoan && userLoan.AssetLoan.Asset && { asset: {
							id: userLoan.AssetLoan.Asset.id,
							bookmarked: userLoan.AssetLoan.Asset.bookmarked,
							assetTag: userLoan.AssetLoan.Asset.assetTag,
							variant: userLoan.AssetLoan.Asset.AssetTypeVariant?.variantName,
							assetType: userLoan.AssetLoan.Asset.AssetTypeVariant?.AssetType?.assetType,
							...(userLoan.AssetLoan.returnEventId && { returnEventId: userLoan.AssetLoan.returnEventId }),
							...(userLoan.AssetLoan.ReturnEvent && { returnDate: userLoan.AssetLoan.ReturnEvent.eventDate }),
							...(userLoan.AssetLoan.TaggedPeripheralLoans && { peripherals: userLoan.AssetLoan.TaggedPeripheralLoans.reduce((peripheralMap, peripheral) => {
								if (!Object.keys(peripheralMap).contains(peripheral.PeripheralType.peripheralName)) {
									peripheralMap[peripheral.PeripheralType.peripheralName] = 1;
								} else peripheralMap[peripheral.PeripheralType.peripheralName] += 1;
								return peripheralMap;
							}, {})}),
						}}),
						...(userLoan.UntaggedPeripheralLoans && userLoan.UntaggedPeripheralLoans.length > 0 && { peripherals: userLoan.UntaggedPeripheralLoans.reduce(((peripheralMap, peripheral) => {
							if (!Object.keys(peripheralMap).contains(peripheral.PeripheralType.peripheralName)) {
								peripheralMap[peripheral.PeripheralType.peripheralName] = 1;
							} else peripheralMap[peripheral.PeripheralType.peripheralName] += 1;

							return peripheralMap;
						}, {}))})
					})
				))},
			}
		}
	}

	User.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		userName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		pid: {
			type: DataTypes.STRING,
			allowNull: true
		},
		deptId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'departments',
				key: 'id'
			}
		},
		bookmarked: {
			type: DataTypes.INTEGER,
			allowNull: false
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
	}, {
		sequelize,
		modelName: 'User',
		indexes: [{
			unique: true,
			fields: ['user_name', 'pid']
		}]
	});
	return User;
}

