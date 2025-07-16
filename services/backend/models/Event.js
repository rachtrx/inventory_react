const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const { Admin, Ast, AccType, Usr, AccLoan, Loan, sequelize, AstLoan, Event, AccTxn, AccReturn, AstSTypeAcc, AstTypeAcc, AstSType, AstType, Rmk } = require('./index.js');

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
        },
        bookmarked: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
    }, {
        sequelize,
        modelName: 'Event'
    });

    return Event;
};