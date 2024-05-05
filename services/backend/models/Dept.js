module.exports = (sequelize, DataTypes) => {
    const { Model } = require('sequelize');
    class Dept extends Model {}

    Dept.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    deptName: {
        type: DataTypes.STRING,
        allowNull: false
    }
    }, {
    sequelize,
    modelName: 'Dept'
    });

    return Dept
}
