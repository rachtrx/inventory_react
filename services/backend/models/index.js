'use strict';

// const fs = require('fs');
// const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
// const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const logger = require('../logging')

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {...config, logging: (msg) => logger.info(msg)});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {...config, logging: (msg) => logger.info(msg)});
}

const AdminModel = require('./Admin')(sequelize, Sequelize.DataTypes);
const DeptModel = require('./Dept')(sequelize, Sequelize.DataTypes);
const UserModel = require('./User')(sequelize, Sequelize.DataTypes);
const AssetTypeModel = require('./AssetType')(sequelize, Sequelize.DataTypes);
const AssetTypeVariantModel = require('./AssetTypeVariant')(sequelize, Sequelize.DataTypes);
const VendorModel = require('./Vendor')(sequelize, Sequelize.DataTypes);
const AssetModel = require('./Asset')(sequelize, Sequelize.DataTypes);
const EventModel = require('./Event')(sequelize, Sequelize.DataTypes);

const db = {
  Admin: AdminModel,
  Dept: DeptModel,
  User: UserModel,
  AssetType: AssetTypeModel,
  AssetTypeVariant: AssetTypeVariantModel,
  Vendor: VendorModel,
  Asset: AssetModel,
  Event: EventModel
}

db.User.belongsTo(db.Dept, { foreignKey: 'deptId', targetKey: 'id' }); // IMPT JAVASCRIPT NAME
db.Dept.hasMany(db.User, { foreignKey: 'deptId' });

db.AssetTypeVariant.belongsTo(db.AssetType, { foreignKey: 'assetTypeId', targetKey: 'id' });
db.AssetType.hasMany(db.AssetTypeVariant, { foreignKey: 'assetTypeId' });

db.Asset.belongsTo(db.AssetTypeVariant, { foreignKey: 'variantId', targetKey: 'id' });
db.AssetTypeVariant.hasMany(db.Asset, { foreignKey: 'variantId' });

db.Asset.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
db.User.hasMany(db.Asset, { foreignKey: 'userId' });

db.Asset.belongsTo(db.Vendor, { foreignKey: 'vendorId', targetKey: 'id' });
db.Vendor.hasMany(db.Asset, { foreignKey: 'vendorId' });

db.Event.belongsTo(db.Asset, { foreignKey: 'assetId', targetKey: 'id' });
db.Asset.hasMany(db.Event, { foreignKey: 'assetId' });

db.Event.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
db.User.hasMany(db.Event, { foreignKey: 'userId' });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.syncAll = async (options = {}) => {
  await sequelize.sync(options);
}; // IMPT sync the database (in server.js)

module.exports = db;
