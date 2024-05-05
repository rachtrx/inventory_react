module.exports = (sequelize, DataTypes) => {
    const { Model } = require('sequelize');
    class Admin extends Model {}

    Admin.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true
    },
    adminName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    pwd: {
        type: DataTypes.STRING,
        allowNull: false
    }
    }, {
    sequelize,
    modelName: 'Admin'
    });

    return Admin;
};