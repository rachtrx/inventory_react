const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AstTypeAcc extends Model {}

	AstTypeAcc.init({
		accessoryTypeId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: 'acc_types',
				key: 'id'
			}
		},
		assetTypeId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: 'ast_types',
				key: 'id'
			}
		},
        totalHits: {
            type: DataTypes.INTEGER,
		},
		consecutiveHits: {
            type: DataTypes.INTEGER,
		},
		consecutiveMisses: {
            type: DataTypes.INTEGER,
		}
	}, {
		sequelize,
		modelName: 'AstTypeAcc',
	});
	return AstTypeAcc;
}