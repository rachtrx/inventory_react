const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AssetLoan extends Model { }

    createAssetLoanObject = function() {

        return {
            ...(this.Asset ? { ...this.Asset.createAssetObject() } : {}),
            ...(loan.AssetLoan.returnEventId && { returnEventId: loan.AssetLoan.returnEventId }),
            ...(loan.AssetLoan.ReturnEvent && { returnDate: loan.AssetLoan.ReturnEvent.eventDate }),
        };
    }

	AssetLoan.init({
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
        assetId: {
            type: DataTypes.STRING,
            references: {
                model: 'assets',
                key: 'id'
            },
        },
        returnEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
            allowNull: true,
        },
	}, {
		sequelize,
		modelName: 'AssetLoan',
        indexes: [
			{
				unique: true,
				fields: ['loan_id', 'asset_id']
			}
		]
	});
    return AssetLoan;
}