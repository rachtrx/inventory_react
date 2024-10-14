'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const configData = require('../../config/config.json');
const config = configData[process.env.NODE_ENV || 'development'];
const logger = require('../../logging.js');

const AdminModel = require('./Admin.js');
const EventModel = require('./Event.js');
const RemarkModel = require('./Rmk.js');
const LoanModel = require('./Loan.js');

const DeptModel = require('./Dept.js');
const UserModel = require('./Usr.js');
const UserLoanModel = require('./UsrLoan.js');

const AssetTypeModel = require('./AstType.js');
const AssetTypeVariantModel = require('./AstSType.js');
const VendorModel = require('./Vendor.js');
const AssetModel = require('./Ast.js');
const AssetLoanModel = require('./AstLoan.js');

const AccessoryTypeModel = require('./AccType.js');
const AccessoryModel = require('./Acc.js');
const AccessoryLoanModel = require('./AccLoan.js');

const SubTypeAccessoryModel = require('./AstSTypeAcc.js');
const TypeAccessoryModel = require('./AstTypeAcc.js');

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {...config, logging: (msg) => logger.info(msg)});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {...config, logging: (msg) => logger.info(msg)});
}

const db = {
  Admin: AdminModel(sequelize),
  Event: EventModel(sequelize),
  Rmk: RemarkModel(sequelize),
  Loan: LoanModel(sequelize),

  Dept: DeptModel(sequelize),
  Usr: UserModel(sequelize),
  UsrLoan: UserLoanModel(sequelize),

  AstType: AssetTypeModel(sequelize),
  AstSType: AssetTypeVariantModel(sequelize),
  Vendor: VendorModel(sequelize),
  Ast: AssetModel(sequelize),
  AstLoan: AssetLoanModel(sequelize),

  AccType: AccessoryTypeModel(sequelize),
  Acc: AccessoryModel(sequelize),
  AccLoan: AccessoryLoanModel(sequelize),

  AstSTypeAcc: SubTypeAccessoryModel(sequelize),
  AstTypeAcc: TypeAccessoryModel(sequelize)
};

// USERS
db.Dept.hasMany(db.Usr, { foreignKey: 'deptId' });
db.Usr.belongsTo(db.Dept, { foreignKey: 'deptId', targetKey: 'id' }); // IMPT JAVASCRIPT NAME

// ASSETS
db.AstType.hasMany(db.AstSType, { foreignKey: 'assetTypeId' });
db.AstSType.belongsTo(db.AstType, { foreignKey: 'assetTypeId', targetKey: 'id' });

db.AstSType.hasMany(db.Ast, { foreignKey: 'subTypeId' });
db.Ast.belongsTo(db.AstSType, { foreignKey: 'subTypeId', targetKey: 'id' });

db.Vendor.hasMany(db.Ast, { foreignKey: 'vendorId' });
db.Ast.belongsTo(db.Vendor, { foreignKey: 'vendorId', targetKey: 'id' });

// PERIPHERALS
db.AccType.hasMany(db.Acc, { foreignKey: 'accessoryTypeId' })
db.Acc.belongsTo(db.AccType, { foreignKey: 'accessoryTypeId', targetKey: 'id' })

// LOANS
db.Acc.hasOne(db.AccLoan, { foreignKey: 'accessoryId' })
db.AccLoan.belongsTo(db.Acc, { foreignKey: 'accessoryId', targetKey: 'id' })

db.Ast.hasMany(db.AstLoan, { foreignKey: 'assetId' });
db.AstLoan.belongsTo(db.Ast, { foreignKey: 'assetId', targetKey: 'id' });

db.Usr.hasMany(db.UsrLoan, { foreignKey: 'userId' });
db.UsrLoan.belongsTo(db.Usr, { foreignKey: 'userId', targetKey: 'id' });

// One-to-Many relationship between Loan and Loan and Ast / Acc
db.Loan.hasMany(db.UsrLoan, { foreignKey: 'loanId' });
db.UsrLoan.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' });

db.Loan.hasOne(db.AstLoan, { foreignKey: 'loanId' });
db.AstLoan.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' });

db.Loan.hasMany(db.AccLoan, { foreignKey: 'loanId' });
db.AccLoan.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' });

// RECOMMENDATIONS
db.AstType.hasMany(db.AstTypeAcc, { foreignKey: 'assetTypeId' });
db.AstTypeAcc.belongsTo(db.AstType, { foreignKey: 'assetTypeId', targetKey: 'id' });

db.AstSType.hasMany(db.AstSTypeAcc, { foreignKey: 'subTypeId' });
db.AstSTypeAcc.belongsTo(db.AstSType, { foreignKey: 'subTypeId', targetKey: 'id' });

db.AccType.hasMany(db.AstTypeAcc, { foreignKey: 'accessoryTypeId' });
db.AstTypeAcc.belongsTo(db.AccType, { foreignKey: 'accessoryTypeId', targetKey: 'id' });

db.AccType.hasMany(db.AstSTypeAcc, { foreignKey: 'accessoryTypeId' });
db.AstSTypeAcc.belongsTo(db.AccType, { foreignKey: 'accessoryTypeId', targetKey: 'id' });

// EVENTS
db.Event.hasOne(db.Loan, { as: 'Reservation', foreignKey: 'reserveEventId' });
db.Loan.belongsTo(db.Event, { as: 'ReserveEvent', foreignKey: 'reserveEventId' });
db.Event.hasOne(db.Loan, { as: 'Cancellation', foreignKey: 'cancelEventId' });
db.Loan.belongsTo(db.Event, { as: 'CancelEvent', foreignKey: 'cancelEventId' });
db.Event.hasOne(db.Loan, { as: 'Loan', foreignKey: 'loanEventId' });
db.Loan.belongsTo(db.Event, { as: 'LoanEvent', foreignKey: 'loanEventId' });

db.Event.hasOne(db.AstLoan, { foreignKey: 'returnEventId' })
db.AstLoan.belongsTo(db.Event, { foreignKey: 'returnEventId', targetKey: 'id' });
db.Event.hasMany(db.AccLoan, { foreignKey: 'returnEventId' })
db.AccLoan.belongsTo(db.Event, { foreignKey: 'returnEventId', targetKey: 'id' });

db.Event.hasOne(db.Ast, { as: 'AddedAsset', foreignKey: 'addEventId' });
db.Event.hasOne(db.Ast, { as: 'DeletedAsset', foreignKey: 'delEventId' });
db.Ast.belongsTo(db.Event, { as: 'AddEvent', foreignKey: 'addEventId' });
db.Ast.belongsTo(db.Event, { as: 'DeleteEvent', foreignKey: 'delEventId' });
db.Event.hasOne(db.Usr, { as: 'AddedUser', foreignKey: 'addEventId' });
db.Event.hasOne(db.Usr, { as: 'DeletedUser', foreignKey: 'delEventId' });
db.Usr.belongsTo(db.Event, { as: 'AddEvent', foreignKey: 'addEventId' });
db.Usr.belongsTo(db.Event, { as: 'DeleteEvent', foreignKey: 'delEventId' });

db.Event.hasOne(db.Loan, { foreignKey: 'loanId' });
db.Loan.belongsTo(db.Event, { foreignKey: 'loanId', targetKey: 'id' });

// Event and Admin
db.Admin.hasMany(db.Event, { foreignKey: 'adminId' })
db.Event.belongsTo(db.Admin, { foreignKey: 'adminId', targetKey: 'id' });

// Remarks
db.Event.hasMany(db.Rmk, { foreignKey: 'eventId' });
db.Rmk.belongsTo(db.Event, { foreignKey: 'eventId', targetKey: 'id' });

db.Admin.hasMany(db.Rmk, { foreignKey: 'adminId' })
db.Rmk.belongsTo(db.Admin, { foreignKey: 'adminId', targetKey: 'id' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.syncAll = async (options = {}) => {
  await sequelize.sync(options);
}; // IMPT sync the database (in server.js)

module.exports = db;
