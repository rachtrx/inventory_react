const logger = require('../../logging');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class LoanDetail extends Model { }

	LoanDetail.init({
		loanId: {
			type: DataTypes.UUID,
			primaryKey: true,
			references: {
				model: 'loans',
				key: 'id'
			}
		},
		userId: {
			type: DataTypes.UUID,
			primaryKey: true,
			references: {
				model: 'users',
				key: 'id'
			},
		},
		startDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		},
		expectedReturnDate: {
			type: DataTypes.DATE,
			allowNull: true
		},
		status: DataTypes.STRING, // PENDING (RESERVED) OR COMPLETE
		eventId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, 
		},
	}, {
		sequelize,
		modelName: 'LoanDetail'
	});
	return LoanDetail;
}

// untag the asset id to be able to stock transfer
  