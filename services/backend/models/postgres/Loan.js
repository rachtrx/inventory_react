const logger = require('../../logging');

module.exports = (sequelize, DataTypes) => {
	const { Model } = require('sequelize');
	class Loan extends Model { }

	Loan.init({
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
  			defaultValue: DataTypes.UUIDV4
		},
		bookmarked: {
			type: DataTypes.INTEGER,
  			defaultValue: 0
		}
	}, {
		sequelize,
		modelName: 'Loan'
	});
    return Loan;
}