const logger = require('../../logging.js');
const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
	class UserLoan extends Model { }

	UserLoan.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.STRING,
			references: {
                model: 'users',
                key: 'id'
            },
		},
		filepath: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		reserveEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
			allowNull: true,
        },
        expectedLoanDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		},
		cancelEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
			allowNull: true,
        },
		expectedReturnDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		},
		loanEventId: {
            type: DataTypes.STRING,
            references: {
                model: 'events',
                key: 'id'
            },
			allowNull: true,
        },
	}, {
		sequelize,
		modelName: 'UserLoan'
	});
    return UserLoan;
}