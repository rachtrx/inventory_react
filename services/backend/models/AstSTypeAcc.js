const logger = require('../logging.js');
const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AstSTypeAcc extends Model {}

	AstSTypeAcc.init({
		accessoryTypeId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: 'acc_types',
				key: 'id'
			}
		},
		assetSubTypeId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: 'ast_s_types',
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
		modelName: 'AstSTypeAcc',
	});
	return AstSTypeAcc;
}
