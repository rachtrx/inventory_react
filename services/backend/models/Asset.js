module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Asset extends Model {}

	Asset.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		serialNumber: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		assetTag: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		variantId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'asset_type_variants',
				key: 'id'
			}
		},
		bookmarked: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false
		},
		location: {
			type: DataTypes.STRING
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: true,
			references: {
				model: 'users',
				key: 'id'
			}
		},
		registeredDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		},
		vendorId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'vendors',
				key: 'id'
			}
		},
		value: {
			type: DataTypes.NUMERIC(10, 2)
		}
	}, {
		sequelize,
		modelName: 'Asset'
	});
	return Asset;
}
