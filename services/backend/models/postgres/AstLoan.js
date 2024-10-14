const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AstLoan extends Model { }

    createAssetLoanObject = function() {

        return {
            ...(this.Ast ? { ...this.Ast.createAssetObject() } : {}),
            ...(loan.AstLoan.returnEventId && { returnEventId: loan.AstLoan.returnEventId }),
            ...(loan.AstLoan.ReturnEvent && { returnDate: loan.AstLoan.ReturnEvent.eventDate }),
        };
    }

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