const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class Dept extends Model {}

    Dept.init({
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
    modelName: 'Dept'
    });

    return Dept
}
