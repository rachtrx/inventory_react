const logger = require('../../logging');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class DepartmentAsset extends Model { }

	DepartmentAsset.init({
		assetId: {
            type: DataTypes.UUID,
            primaryKey: true,
            references: {
                model: 'assets',
                key: 'id'
            },
        },
		deptId: {
			type: DataTypes.UUID,
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