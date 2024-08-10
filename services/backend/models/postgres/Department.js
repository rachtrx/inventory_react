const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const { Model } = require('sequelize');
    class Department extends Model {}

    Department.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
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
