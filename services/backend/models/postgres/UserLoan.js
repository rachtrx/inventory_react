const logger = require('../../logging.js');
const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class UserLoan extends Model { 

		createUserLoanObject = function() {

			const loan = this.Loan;
			const assetLoan = loan?.AssetLoan;
			const peripheralLoans = loan?.PeripheralLoans;

			return {
				userId: this.User.id,
				userName: this.User.userName,
				bookmarked: this.User.bookmarked,
				...(loan && loan.createLoanObject()),
				...(assetLoan && assetLoan.Asset && { asset: {
					id: loan.AssetLoan.Asset.id,
					bookmarked: loan.AssetLoan.Asset.bookmarked,
					assetTag: loan.AssetLoan.Asset.assetTag,
					variant: loan.AssetLoan.Asset.AssetTypeVariant?.variantName,
					assetType: loan.AssetLoan.Asset.AssetTypeVariant?.AssetType?.assetType,
					...(loan.AssetLoan.returnEventId && { returnEventId: loan.AssetLoan.returnEventId }),
					...(loan.AssetLoan.ReturnEvent && { returnDate: loan.AssetLoan.ReturnEvent.eventDate }),
				}}),
				...(peripheralLoans && peripheralLoans.length > 0 && { peripherals: loan.PeripheralLoans.reduce(((peripheralMap, peripheral) => {
					if (!Object.keys(peripheralMap).contains(peripheral.PeripheralType.peripheralName)) {
						peripheralMap[peripheral.PeripheralType.peripheralName] = 1;
					} else peripheralMap[peripheral.PeripheralType.peripheralName] += 1;

					return peripheralMap;
				}, {}))})
			}
		}
	}

	UserLoan.init({
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
		userId: {
			type: DataTypes.STRING,
			references: {
                model: 'users',
                key: 'id'
            },
		},
		filepath: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	}, {
		sequelize,
		modelName: 'UserLoan'
	});
    return UserLoan;
}