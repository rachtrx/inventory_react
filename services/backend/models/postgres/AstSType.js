const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AstSType extends Model {}

	AstSType.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		assetTypeId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'ast_types',
				key: 'id'
			}
		},
		subTypeName: {
			type: DataTypes.STRING,
			allowNull: false
		},
	}, {
		sequelize,
		modelName: 'AstSType',
	});
	return AstSType;
}
