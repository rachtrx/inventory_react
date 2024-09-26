const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../../logging.js');

module.exports = (sequelize) => {
	class PeripheralType extends Model {

		createPeripheralTypeObject() {
			const plainObj = this.get({ plain: true });
			logger.info(plainObj);

			return {
				id: this.id,
				peripheralName: this.peripheralName,
				availableCount: this.availableCount,
				...this.Peripherals?.length > 0 && {
					totalCount: this.availableCount + this.Peripherals.reduce((count, peripheral) => count += peripheral.count, 0),
					assets: this.Peripherals.reduce((assetAcc, peripheral) => {

						// Each peripheral on loan can only be tagged to 1 asset
						const asset = peripheral.PeripheralLoans
							.find(peripheralLoan => peripheralLoan.UserLoan?.AssetLoan?.Asset?.id)
							?.UserLoan?.AssetLoan?.Asset;

						if (!assetAcc[asset.id]) {
							assetAcc[asset.id] = {assetTag: asset.assetTag, count: 1}
						}
						else assetAcc[asset.id].count += 1;
						return assetAcc;
					}, {}),
					users: this.Peripherals.reduce((userAcc, peripheral) => {
						peripheral.PeripheralLoans.forEach(peripheralLoan => {
							const user = peripheralLoan.UserLoan.User;

							if (!userAcc[user.id]) {
								userAcc[user.id] = {userName: user.userName, count: 1}
							}
							else userAcc[user.id].count += 1;
						})
						return userAcc;
					}, {}),
				}
			}
		} 
	}

	PeripheralType.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		peripheralName: {
			type: DataTypes.STRING,
			allowNull: false
		},
        availableCount: {
            type: DataTypes.INTEGER,
			allowNull: false
        }
	}, {
		sequelize,
		modelName: 'PeripheralType'
	});
	return PeripheralType;
}
