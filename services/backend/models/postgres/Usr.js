const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;
const logger = require('../../logging.js');

module.exports = (sequelize) => {
	class Usr extends Model {

		createUserObject = function() {
			const plainUser = this;
			// const plainUser = this.get({ plain: true })
			// logger.info(plainUser);

			return {
				userId: plainUser.id,
				userName: plainUser.userName,
				bookmarked: plainUser.bookmarked && true || false,
				...(plainUser.Dept && {dept: plainUser.Dept.deptName}),
				...(plainUser.AddEvent && {addedDate: plainUser.AddEvent.eventDate}),
				...(plainUser.DeleteEvent && {deletedDate: plainUser.DeleteEvent.eventDate}),
				...(plainUser.UsrLoans && {loans: (plainUser.UsrLoans.map((userLoan) => {
					const loan = userLoan.Loan;
					return loan ? loan.createLoanObject() : {}
				}))})
			}
		}
	}

	Usr.init({
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
				model: 'depts',
				key: 'id'
			}
		},
		bookmarked: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		addEventId: {
			type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
		},
		delEventId: {
			type: DataTypes.STRING,
			references: {
			  model: 'events',
			  key: 'id',
			},
		},
	}, {
		sequelize,
		modelName: 'Usr',
		indexes: [{
			unique: true,
			fields: ['user_name', 'pid']
		}]
	});
	return Usr;
}

