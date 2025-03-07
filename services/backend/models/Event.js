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
        openedDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        openedAdminId: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id',
            },
        },
        expectedCloseDate: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        closedDate: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        closedAdminId: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id',
            },
        },
        cancelled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        sequelize,
        modelName: 'Event'
    });

    return Event;
};