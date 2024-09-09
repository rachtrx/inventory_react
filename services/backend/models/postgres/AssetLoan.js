const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AssetLoan extends Model { }

	AssetLoan.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        userLoanId: {
            type: DataTypes.STRING,
            references: {
                model: 'user_loans',
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
				fields: ['user_loan_id', 'asset_id']
			}
		]
	});
    return AssetLoan;
}