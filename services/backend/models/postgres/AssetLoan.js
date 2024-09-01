const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AssetLoan extends Model { }

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
        reserveEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
			allowNull: true,
        },
        expectedLoanDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		},
        loanEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
			allowNull: false,
        },
        expectedReturnDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
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