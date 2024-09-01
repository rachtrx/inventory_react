const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class Admin extends Model {}

    Admin.init({
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    adminName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    pwd: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    authType: {
        type: DataTypes.ENUM('SSO', 'local'),
        allowNull: false,
    },
    preferences: {
        type: DataTypes.JSON,
        defaultValue: {
            dashboard: {
                theme: 'light',
                layout: 'grid',
            }
        }
    }
    }, {
    sequelize,
    modelName: 'Admin',
    timestamps: true,
    });
    return Admin;
}
