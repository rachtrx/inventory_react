const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class Loan extends Model { }

    Loan.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
    }, {
        sequelize,
        modelName: 'Loan'
    });

    return Loan;
};