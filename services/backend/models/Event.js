const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class Event extends Model {}

    Event.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true
        },
        eventDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        adminId: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
    sequelize,
    modelName: 'Event'
    });

    return Event;
};