const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../../logging.js');

module.exports = (sequelize) => {
	class User extends Model {

		createUserObject = function() {
			const plainUser = this;
			// const plainUser = this.get({ plain: true })
			logger.info(plainUser);

			return {
				id: plainUser.id,
				userName: plainUser.userName,
				bookmarked: plainUser.bookmarked && true || false,
				department: plainUser.Department.deptName,
				...(plainUser.AddEvent && {addedDate: plainUser.AddEvent.eventDate}),
				...(plainUser.DeleteEvent && {deletedDate: plainUser.DeleteEvent.eventDate}),
				...(plainUser.UserLoans && {loans: (plainUser.UserLoans.map((userLoan) => {
					const loan = userLoan.Loan;

					return {
						...(loan.ReserveEvent && { reserveDate: loan.ReserveEvent.eventDate }),
						...(loan.reserveEventId && { reserveEventId: loan.reserveEventId }),
						...(loan.CancelEvent && { cancelDate: loan.CancelEvent.eventDate }),
						...(loan.cancelEventId && { cancelDate: loan.cancelEventId }),
						...(loan.expectedLoanDate && { expectedLoanDate: loan.expectedLoanDate }),
						...(loan.loanEventId && { loanEventId: loan.loanEventId }),
						...(loan.LoanEvent && { loanDate: loan.LoanEvent.eventDate }),
						...(loan.expectedReturnDate && { expectedReturnDate: loan.expectedReturnDate }),
						
					}
				}))})
			}
		}
	}

	User.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		userName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		pid: {
			type: DataTypes.STRING,
			allowNull: true
		},
		deptId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'departments',
				key: 'id'
			}
		},
		bookmarked: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		add_event_id: {
			type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
		},
		delete_event_id: {
			type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
		},
	}, {
		sequelize,
		modelName: 'User',
		indexes: [{
			unique: true,
			fields: ['user_name', 'pid']
		}]
	});
	return User;
}

