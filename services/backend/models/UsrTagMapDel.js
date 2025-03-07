const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class UsrTagMapDel extends Model {}

    UsrTagMapDel.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        usrTagMapId: {
            type: DataTypes.STRING,
            references: {
                model: 'usr_tag_maps',
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
        modelName: 'UsrTagMapDel'
    });
    return UsrTagMapDel;
}