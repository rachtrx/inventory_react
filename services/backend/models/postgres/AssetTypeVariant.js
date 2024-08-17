<<<<<<< HEAD
const { v4: uuidv4 } = require('uuid');

=======
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class AssetTypeVariant extends Model {}

	AssetTypeVariant.init({
		id: {
<<<<<<< HEAD
			type: DataTypes.UUID,
			primaryKey: true,
  			defaultValue: DataTypes.UUIDV4,
		},
		assetTypeId: {
			type: DataTypes.UUID,
=======
			type: DataTypes.STRING,
			primaryKey: true
		},
		assetTypeId: {
			type: DataTypes.STRING,
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
			allowNull: false,
			references: {
				model: 'asset_types',
				key: 'id'
			}
		},
		variantName: {
			type: DataTypes.STRING,
			allowNull: false
		},
<<<<<<< HEAD
=======
		// addedDate: {
		// 	type: DataTypes.DATE,
		// 	defaultValue: DataTypes.NOW
		// }
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
	}, {
		sequelize,
		modelName: 'AssetTypeVariant',
	});
	return AssetTypeVariant;
}
