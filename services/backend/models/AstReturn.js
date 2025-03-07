const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class AstReturn extends Model {}

    AstReturn.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        astLoanId: {
            type: DataTypes.STRING,
            references: {
                model: 'ast_loans',
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
        modelName: 'AstReturn'
    });
    return AstReturn;
}