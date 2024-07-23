module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	const Dept = require('./Dept');
	class User extends Model {

		createUserObject = function() {
			const plainUser = this.get({ plain: true })
			return {
				id: plainUser.id,
				name: plainUser.userName,
				bookmarked: plainUser.bookmarked && true || false,
				deletedDate: plainUser.deletedDate || null,
				addedDate: plainUser.addedDate,
				department: plainUser.Dept.deptName,
				...plainUser.Assets && { 
					assets: plainUser.Assets.map(asset => ({
						id: asset.id,
						bookmarked: asset.bookmarked,
						assetTag: asset.assetTag,
						variant: asset.AssetTypeVariant?.variantName,
						assetType: asset.AssetTypeVariant?.AssetType?.assetType,
					})),
				},
				status: plainUser.deletedDate ? 'Deleted' : plainUser.Assets.length === 1 ? '1 Asset' : plainUser.Assets.length > 1 ? `${plainUser.Assets.length} Assets` : 'Available',
			}
		}
	}

	User.init({
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		userName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		pid: {
			type: DataTypes.STRING,
			allowNull: true
		},
		deptId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'depts',
				key: 'id'
			}
		},
		bookmarked: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		addedDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		},
		deletedDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		},
	}, {
		sequelize,
		modelName: 'User',
		indexes: [{
			unique: true,
			fields: ['user_name', 'pid']
		}]
	});
	return User;
}

