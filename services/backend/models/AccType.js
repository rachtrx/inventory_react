const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../logging.js');

module.exports = (sequelize) => {
	class AccType extends Model {

		// createAccessoryTypeObject() {
		// 	const plainObj = this.get({ plain: true });
		// 	logger.info(plainObj);

		// 	return {
		// 		accessoryTypeId: this.id,
		// 		accessoryName: this.accessoryName,
		// 		available: this.available,
		// 		...this.Accs?.length > 0 && {
		// 			totalCount: this.available + this.Accs.reduce((count, accessory) => count += accessory.count, 0), // TODO filter based on not returned and get length
		// 			assets: this.Accs.reduce((assetAcc, acc) => {

		// 				// Each peripheral on loan can only be tagged to 1 asset
		// 				const asset = acc.AccLoans
		// 					.find(accLoan => accLoan.UsrLoan?.AstLoan?.Ast?.id)
		// 					?.UsrLoan?.AstLoan?.Ast;

		// 				if (!assetAcc[asset.id]) {
		// 					assetAcc[asset.id] = {assetTag: asset.assetTag, count: 1}
		// 				}
		// 				else assetAcc[asset.id].count += 1;
		// 				return assetAcc;
		// 			}, {}),
		// 			users: this.Accs.reduce((userAcc, acc) => {
		// 				acc.AccLoans.forEach(accLoan => {
		// 					const user = accLoan.UsrLoan.Usr;

		// 					if (!userAcc[user.id]) {
		// 						userAcc[user.id] = {userName: user.userName, count: 1}
		// 					}
		// 					else userAcc[user.id].count += 1;
		// 				})
		// 				return userAcc;
		// 			}, {}),
		// 		}
		// 	}
		// } 
	}

	AccType.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		accessoryName: {
			type: DataTypes.STRING,
			allowNull: false
		},
        available: {
            type: DataTypes.INTEGER,
			allowNull: false
        }
	}, {
		sequelize,
		modelName: 'AccType'
	});
	return AccType;
}
