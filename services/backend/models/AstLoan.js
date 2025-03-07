const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AstLoan extends Model { }

	AstLoan.init({
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
                model: 'asts',
                key: 'id'
            },
        },
	}, {
		sequelize,
		modelName: 'AstLoan',
        indexes: [
			{
				unique: true,
				fields: ['loan_id', 'asset_id']
			}
		]
	});
    return AstLoan;
}