const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class AstSTypeDept extends Model { }

	AstSTypeDept.init({
		assetId: {
            type: DataTypes.STRING,
            primaryKey: true,
            references: {
                model: 'asts',
                key: 'id'
            },
        },
		deptId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: 'depts',
				key: 'id'
			}
		},
	}, {
		sequelize,
		modelName: 'AstSTypeDept',
		indexes: [
			{
				unique: true,
				fields: ['asset_id', 'dept_id']
			}
		]
	});
	return AstSTypeDept;
}