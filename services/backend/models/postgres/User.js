const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class User extends Model {

		createUserObject = function() {
			const plainUser = this.get({ plain: true })
			// logger.info(plainUser);

			return {
				id: plainUser.id,
				userName: plainUser.userName,
				bookmarked: plainUser.bookmarked && true || false,
				deletedDate: plainUser.deletedDate || null,
				addedDate: plainUser.addedDate,
				department: plainUser.Department.deptName,
				...plainUser.LoanDetails && {loans: (plainUser.LoanDetails.map((loanDetails) => ({ 
					id: loanDetails.Loan.id,
					status: loanDetails.status,
					startDate: loanDetails.startDate,
					expectedReturnDate: loanDetails.expectedReturnDate,
					...loanDetails.Loan.Asset && {asset: {
						id: loanDetails.Loan.Asset.id,
						bookmarked: loanDetails.Loan.Asset.bookmarked,
						assetTag: loanDetails.Loan.Asset.assetTag,
						variant: loanDetails.Loan.Asset.AssetTypeVariant?.variantName,
						assetType: loanDetails.Loan.Asset.AssetTypeVariant?.AssetType?.assetType,
					}},
					...loanDetails.Loan.Peripherals && {peripherals: (loanDetails.Loan.Peripherals.map((peripheral) => ({
						id: peripheral.peripheralType?.id,
						peripheralName: peripheral.peripheralType?.peripheralName,
						count: peripheral.count
					})))}
				})))},
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

