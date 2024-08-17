<<<<<<< HEAD
const logger = require('../../logging');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Peripheral extends Model { }

	Peripheral.init({
		loanId: {
			type: DataTypes.UUID,
			primaryKey: true,
			references: {
				model: 'loans',
				key: 'id'
			}
		},
		peripheralTypeId: {
			type: DataTypes.UUID,
			references: {
				model: 'peripheral_types',
				key: 'id'
			}
		},
		count: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
=======
module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Peripherals extends Model {}

	Peripherals.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
        userId: {
            allowNull: false,
			references: {
				model: 'admin',
				key: 'id'
			}
        },
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
        favourite: {
            type: DataTypes.INTEGER,
			allowNull: false
        }
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
	}, {
		sequelize,
		modelName: 'Peripheral'
	});
<<<<<<< HEAD
	return Peripheral;
}

// untag the asset id to be able to stock transfer
  
=======
	return Peripherals;
}
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
