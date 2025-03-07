const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class AstDelete extends Model {}

    AstDelete.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        assetId: {
            type: DataTypes.STRING,
            references: {
                model: 'asts',
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
        modelName: 'AstDelete'
    });
    return AstDelete;
}