const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class Peripheral extends Model { }

    Peripheral.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        peripheralTypeId: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Peripheral'
    });
    
    return Peripheral;
}
