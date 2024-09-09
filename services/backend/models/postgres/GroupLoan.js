const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class GroupLoan extends Model { }

    GroupLoan.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
    }, {
        sequelize,
        modelName: 'GroupLoan'
    });

    return GroupLoan;
};