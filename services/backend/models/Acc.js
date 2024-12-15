const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class Acc extends Model { }

    Acc.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        accessoryTypeId: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Acc'
    });
    
    return Acc;
}
