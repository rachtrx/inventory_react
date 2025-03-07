const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class UsrDelete extends Model {}

    UsrDelete.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            references: {
                model: 'usrs',
                key: 'id'
            },
        },
        eventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'UsrDelete'
    });
    return UsrDelete;
}