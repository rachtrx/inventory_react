const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class AstTagMapDel extends Model {}

    AstTagMapDel.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        astTagMapId: {
            type: DataTypes.STRING,
            references: {
                model: 'ast_tag_maps',
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
        modelName: 'AstTagMapDel'
    });
    return AstTagMapDel;
}