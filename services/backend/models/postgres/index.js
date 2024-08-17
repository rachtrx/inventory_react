'use strict';

// const fs = require('fs');
// const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
// const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../config/config.json')[env];
const logger = require('../../logging');

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {...config, logging: (msg) => logger.info(msg)});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {...config, logging: (msg) => logger.info(msg)});
}

const DeptModel = require('./Department')(sequelize, Sequelize.DataTypes);
const UserModel = require('./User')(sequelize, Sequelize.DataTypes);
const AssetTypeModel = require('./AssetType')(sequelize, Sequelize.DataTypes);
const AssetTypeVariantModel = require('./AssetTypeVariant')(sequelize, Sequelize.DataTypes);
const VendorModel = require('./Vendor')(sequelize, Sequelize.DataTypes);
const AssetModel = require('./Asset')(sequelize, Sequelize.DataTypes);
const PeripheralTypeModel = require('./PeripheralType')(sequelize, Sequelize.DataTypes);
const LoanModel = require('./Loan')(sequelize, Sequelize.DataTypes);
const AssetLoanModel = require('./AssetLoan')(sequelize, Sequelize.DataTypes);
const PeripheralModel = require('./Peripheral')(sequelize, Sequelize.DataTypes);
const LoanDetailModel = require('./LoanDetail')(sequelize, Sequelize.DataTypes);
const VariantPeripheralModel = require('./VariantPeripheral')(sequelize, Sequelize.DataTypes);
const AssetTypePeripheralModel = require('./AssetTypePeripheral')(sequelize, Sequelize.DataTypes);

const db = {
  Department: DeptModel,
  User: UserModel,
  AssetType: AssetTypeModel,
  AssetTypeVariant: AssetTypeVariantModel,
  Vendor: VendorModel,
  Asset: AssetModel,
  Loan: LoanModel,
  AssetLoan: AssetLoanModel,
  PeripheralType: PeripheralTypeModel,
  Peripheral: PeripheralModel,
  LoanDetail: LoanDetailModel,
  VariantPeripheral: VariantPeripheralModel,
  AssetTypePeripheral: AssetTypePeripheralModel
}

db.Department.hasMany(db.User, { foreignKey: 'deptId' });
db.User.belongsTo(db.Department, { foreignKey: 'deptId', targetKey: 'id' }); // IMPT JAVASCRIPT NAME

db.AssetType.hasMany(db.AssetTypeVariant, { foreignKey: 'assetTypeId' });
db.AssetTypeVariant.belongsTo(db.AssetType, { foreignKey: 'assetTypeId', targetKey: 'id' });

db.AssetTypeVariant.hasMany(db.Asset, { foreignKey: 'variantId' });
db.Asset.belongsTo(db.AssetTypeVariant, { foreignKey: 'variantId', targetKey: 'id' });

db.Vendor.hasMany(db.Asset, { foreignKey: 'vendorId' });
db.Asset.belongsTo(db.Vendor, { foreignKey: 'vendorId', targetKey: 'id' });

db.PeripheralType.hasMany(db.Peripheral, { foreignKey: 'peripheralTypeId' })
db.Peripheral.belongsTo(db.PeripheralType, { foreignKey: 'peripheralTypeId', targetKey: 'id' })

db.Asset.hasOne(db.AssetLoan, { foreignKey: 'assetId' });
db.AssetLoan.belongsTo(db.Asset, { foreignKey: 'assetId', targetKey: 'id' });

db.User.hasMany(db.LoanDetail, { foreignKey: 'userId' });
db.LoanDetail.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });

// One-to-Many relationship between Loan and User Loan and Loan and Peripheral
db.Loan.hasMany(db.LoanDetail, { foreignKey: 'loanId' });
db.LoanDetail.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' });

db.Loan.hasMany(db.Peripheral, { foreignKey: 'loanId' });
db.Peripheral.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' });

// One-to-One relationship between Loan and Asset
db.Loan.hasOne(db.Asset, { foreignKey: 'loanId' });
db.Asset.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' });

db.AssetType.hasMany(db.AssetTypePeripheral, { foreignKey: 'asset_type_id' });
db.AssetTypePeripheral.belongsTo(db.AssetType, { foreignKey: 'asset_type_id', targetKey: 'id' });

db.AssetTypeVariant.hasMany(db.VariantPeripheral, { foreignKey: 'variant_id' });
db.VariantPeripheral.belongsTo(db.AssetTypeVariant, { foreignKey: 'variant_id', targetKey: 'id' });

db.PeripheralType.hasMany(db.AssetTypePeripheral, { foreignKey: 'peripheralTypeId' });
db.AssetTypePeripheral.belongsTo(db.PeripheralType, { foreignKey: 'peripheralTypeId', targetKey: 'id' });

db.PeripheralType.hasMany(db.VariantPeripheral, { foreignKey: 'peripheralTypeId' });
db.VariantPeripheral.belongsTo(db.PeripheralType, { foreignKey: 'peripheralTypeId', targetKey: 'id' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.syncAll = async (options = {}) => {
  await sequelize.sync(options);
}; // IMPT sync the database (in server.js)

module.exports = db;
