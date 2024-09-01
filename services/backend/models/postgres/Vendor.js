const logger = require('../../logging.js');
const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class Vendor extends Model {}

    Vendor.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        vendorName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Vendor'
    });

    return Vendor;
};