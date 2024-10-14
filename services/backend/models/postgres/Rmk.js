const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class Rmk extends Model {}

    Rmk.init({
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        eventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            }
        },
        text: {
            type: DataTypes.TEXT,  
            allowNull: true  
        },
        remarkDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        adminId: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Rmk',
        timestamps: true,
    });

    return Rmk;
}
