const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class PeripheralType extends Model {

		createPeripheralTypeObject() {
			const plainObj = this.get({ plain: true });
			logger.info(plainObj);

			return {
				id: this.id,
				peripheralName: this.peripheralName,
				availableCount: this.availableCount,
				...this.peripherals?.length > 0 && {
					totalCount: this.availableCount + this.peripherals.reduce((count, peripheral) => count += peripheral.count, 0),
					loans: this.peripherals.map((peripheral) => ({
						id: peripheral.loanId,
						userId: peripheral.Loan.User.id,
						userName: peripheral.Loan.User.userName,
						assetId: peripheral.Loan.Asset?.id,
						assetTag: peripheral.Loan.Asset?.assetTag,
						serialNumber: peripheral.Loan.Asset?.serialNumber,
					}))
				}
			}
		} 
	}

	PeripheralType.init({
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
  			defaultValue: DataTypes.UUIDV4
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