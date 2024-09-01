const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class Department extends Model {}

    Department.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    deptName: {
        type: DataTypes.STRING,
        allowNull: false
    }
    }, {
    sequelize,
    modelName: 'Department'
    });

    return Department
}
