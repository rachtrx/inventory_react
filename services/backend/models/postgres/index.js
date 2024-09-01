'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const configData = require('../../config/config.json');
const config = configData[process.env.NODE_ENV || 'development'];
const logger = require('../../logging.js');

const AdminModel = require('./Admin.js');
const EventModel = require('./Event.js');
const RemarkModel = require('./Remark.js');
const LoanModel = require('./Loan.js');

const DeptModel = require('./Department.js');
const UserModel = require('./User.js');
const UserLoanModel = require('./UserLoan.js');

const AssetTypeModel = require('./AssetType.js');
const AssetTypeVariantModel = require('./AssetTypeVariant.js');
const VendorModel = require('./Vendor.js');
const AssetModel = require('./Asset.js');
const AssetLoanModel = require('./AssetLoan.js');

const PeripheralTypeModel = require('./PeripheralType.js');
const PeripheralModel = require('./Peripheral.js');
const PeripheralLoanModel = require('./PeripheralLoan.js');

const VariantPeripheralModel = require('./VariantPeripheral.js');
const AssetTypePeripheralModel = require('./AssetTypePeripheral.js');

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {...config, logging: (msg) => logger.info(msg)});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {...config, logging: (msg) => logger.info(msg)});
}

const db = {
  Admin: AdminModel(sequelize),
  Event: EventModel(sequelize),
  Remark: RemarkModel(sequelize),
  Loan: LoanModel(sequelize),

  Department: DeptModel(sequelize),
  User: UserModel(sequelize),
  UserLoan: UserLoanModel(sequelize),

  AssetType: AssetTypeModel(sequelize),
  AssetTypeVariant: AssetTypeVariantModel(sequelize),
  Vendor: VendorModel(sequelize),
  Asset: AssetModel(sequelize),
  AssetLoan: AssetLoanModel(sequelize),

  PeripheralType: PeripheralTypeModel(sequelize),
  Peripheral: PeripheralModel(sequelize),
  PeripheralLoan: PeripheralLoanModel(sequelize),

  VariantPeripheral: VariantPeripheralModel(sequelize),
  AssetTypePeripheral: AssetTypePeripheralModel(sequelize)
};

// USERS
db.Department.hasMany(db.User, { foreignKey: 'deptId' });
db.User.belongsTo(db.Department, { foreignKey: 'deptId', targetKey: 'id' }); // IMPT JAVASCRIPT NAME

// ASSETS
db.AssetType.hasMany(db.AssetTypeVariant, { foreignKey: 'assetTypeId' });
db.AssetTypeVariant.belongsTo(db.AssetType, { foreignKey: 'assetTypeId', targetKey: 'id' });

db.AssetTypeVariant.hasMany(db.Asset, { foreignKey: 'variantId' });
db.Asset.belongsTo(db.AssetTypeVariant, { foreignKey: 'variantId', targetKey: 'id' });

db.Vendor.hasMany(db.Asset, { foreignKey: 'vendorId' });
db.Asset.belongsTo(db.Vendor, { foreignKey: 'vendorId', targetKey: 'id' });

// PERIPHERALS
db.PeripheralType.hasMany(db.Peripheral, { foreignKey: 'peripheralTypeId' })
db.Peripheral.belongsTo(db.PeripheralType, { foreignKey: 'peripheralTypeId', targetKey: 'id' })

// LOANS
db.Peripheral.hasMany(db.PeripheralLoan, { foreignKey: 'peripheralId' })
db.PeripheralLoan.belongsTo(db.Peripheral, { foreignKey: 'peripheralId', targetKey: 'id' })

db.Asset.hasMany(db.AssetLoan, { foreignKey: 'assetId' });
db.AssetLoan.belongsTo(db.Asset, { foreignKey: 'assetId', targetKey: 'id' });

db.User.hasMany(db.UserLoan, { foreignKey: 'userId' });
db.UserLoan.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });

// One-to-Many relationship between Loan and Loan and Asset / Peripheral
db.Loan.hasMany(db.UserLoan, { foreignKey: 'loanId' });
db.UserLoan.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' });

db.Loan.hasMany(db.AssetLoan, { foreignKey: 'loanId' });
db.AssetLoan.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' });

db.Loan.hasMany(db.PeripheralLoan, { foreignKey: 'loanId' });
db.PeripheralLoan.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' });

db.UserLoan.hasMany(db.AssetLoan, { foreignKey: 'userLoanId' });
db.AssetLoan.belongsTo(db.UserLoan, { foreignKey: 'userLoanId', targetKey: 'id' });

db.UserLoan.hasMany(db.PeripheralLoan, { foreignKey: 'userLoanId' });
db.PeripheralLoan.belongsTo(db.UserLoan, { foreignKey: 'userLoanId', targetKey: 'id' });

// RECOMMENDATIONS
db.AssetType.hasMany(db.AssetTypePeripheral, { foreignKey: 'assetTypeId' });
db.AssetTypePeripheral.belongsTo(db.AssetType, { foreignKey: 'assetTypeId', targetKey: 'id' });

db.AssetTypeVariant.hasMany(db.VariantPeripheral, { foreignKey: 'variantId' });
db.VariantPeripheral.belongsTo(db.AssetTypeVariant, { foreignKey: 'variantId', targetKey: 'id' });

db.PeripheralType.hasMany(db.AssetTypePeripheral, { foreignKey: 'peripheralTypeId' });
db.AssetTypePeripheral.belongsTo(db.PeripheralType, { foreignKey: 'peripheralTypeId', targetKey: 'id' });

db.PeripheralType.hasMany(db.VariantPeripheral, { foreignKey: 'peripheralTypeId' });
db.VariantPeripheral.belongsTo(db.PeripheralType, { foreignKey: 'peripheralTypeId', targetKey: 'id' });

// EVENTS
db.Event.hasOne(db.Asset, { as: 'AddedAsset', foreignKey: 'add_event_id' });
db.Event.hasOne(db.Asset, { as: 'DeletedAsset', foreignKey: 'delete_event_id' });
db.Asset.belongsTo(db.Event, { as: 'AddEvent', foreignKey: 'add_event_id' });
db.Asset.belongsTo(db.Event, { as: 'DeleteEvent', foreignKey: 'delete_event_id' });
db.Event.hasOne(db.User, { as: 'AddedUser', foreignKey: 'add_event_id' });
db.Event.hasOne(db.User, { as: 'DeletedUser', foreignKey: 'delete_event_id' });
db.User.belongsTo(db.Event, { as: 'AddEvent', foreignKey: 'add_event_id' });
db.User.belongsTo(db.Event, { as: 'DeleteEvent', foreignKey: 'delete_event_id' });

db.Event.hasOne(db.AssetLoan, { as: 'LoanedAsset', foreignKey: 'loan_event_id' });
db.Event.hasOne(db.AssetLoan, { as: 'ReservedAsset', foreignKey: 'reserve_event_id' });
db.Event.hasOne(db.AssetLoan, { as: 'ReturnedAsset', foreignKey: 'return_event_id' })
db.AssetLoan.belongsTo(db.Event, { as: 'LoanEvent', foreignKey: 'loan_event_id' });
db.AssetLoan.belongsTo(db.Event, { as: 'ReserveEvent', foreignKey: 'reserve_event_id' });
db.AssetLoan.belongsTo(db.Event, { as: 'ReturnEvent', foreignKey: 'return_event_id' });

db.Event.hasOne(db.PeripheralLoan, { as: 'LoanedPeripheral', foreignKey: 'loan_event_id' });
db.Event.hasOne(db.PeripheralLoan, { as: 'ReservedPeripheral', foreignKey: 'reserve_event_id' });
db.Event.hasOne(db.PeripheralLoan, { as: 'ReturnedPeripheral', foreignKey: 'return_event_id' })
db.PeripheralLoan.belongsTo(db.Event, { as: 'LoanEvent', foreignKey: 'loan_event_id' });
db.PeripheralLoan.belongsTo(db.Event, { as: 'ReserveEvent', foreignKey: 'reserve_event_id' });
db.PeripheralLoan.belongsTo(db.Event, { as: 'ReturnEvent', foreignKey: 'return_event_id' });

// Event and Admin
db.Admin.hasMany(db.Event, { foreignKey: 'adminId' })
db.Event.belongsTo(db.Admin, { foreignKey: 'adminId', targetKey: 'id' });

// Remarks
db.Event.hasMany(db.Remark, { foreignKey: 'eventId' });
db.Remark.belongsTo(db.Event, { foreignKey: 'eventId', targetKey: 'id' });

db.Admin.hasMany(db.Remark, { foreignKey: 'adminId' })
db.Remark.belongsTo(db.Admin, { foreignKey: 'adminId', targetKey: 'id' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.syncAll = async (options = {}) => {
  await sequelize.sync(options);
}; // IMPT sync the database (in server.js)

module.exports = db;
