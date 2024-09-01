const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class DepartmentAsset extends Model { }

	DepartmentAsset.init({
		assetId: {
            type: DataTypes.STRING,
            primaryKey: true,
            references: {
                model: 'assets',
                key: 'id'
            },
        },
		deptId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: 'departments',
				key: 'id'
			}
		},
	}, {
		sequelize,
		modelName: 'DepartmentAsset',
		indexes: [
			{
				unique: true,
				fields: ['asset_id', 'dept_id']
			}
		]
	});
	return DepartmentAsset;
}