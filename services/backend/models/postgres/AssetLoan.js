const logger = require('../../logging');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class AssetLoan extends Model { }

	AssetLoan.init({
        loanId: {
            type: DataTypes.UUID,
            primaryKey: true,
            references: {
                model: 'loans',
                key: 'id'
            },
        },
        assetId: {
            type: DataTypes.UUID,
            primaryKey: true,
            references: {
                model: 'assets',
                key: 'id'
            },
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