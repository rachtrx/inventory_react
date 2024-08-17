<<<<<<< HEAD
const logger = require('../../logging');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	const Department = require('./Department');
=======
module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	const Dept = require('./Dept');
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
	class User extends Model {

		createUserObject = function() {
			const plainUser = this.get({ plain: true })
<<<<<<< HEAD
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
=======
			return {
				id: plainUser.id,
				name: plainUser.userName,
				bookmarked: plainUser.bookmarked && true || false,
				deletedDate: plainUser.deletedDate || null,
				addedDate: plainUser.addedDate,
				department: plainUser.Dept.deptName,
				...plainUser.Assets && { 
					assets: plainUser.Assets.map(asset => ({
						id: asset.id,
						bookmarked: asset.bookmarked,
						assetTag: asset.assetTag,
						variant: asset.AssetTypeVariant?.variantName
					}))
				}
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
			}
		}
	}

	User.init({
		id: {
<<<<<<< HEAD
			type: DataTypes.UUID,
			primaryKey: true,
  			defaultValue: DataTypes.UUIDV4
=======
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
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
<<<<<<< HEAD
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: 'departments',
=======
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'depts',
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
				key: 'id'
			}
		},
		bookmarked: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		addedDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		},
		deletedDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
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

