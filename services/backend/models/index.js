'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const configData = require('../config/config.json');
const config = configData[process.env.NODE_ENV || 'development'];
const logger = require('../logging.js');

const AstTagModel = require('./AstTag.js')
const AstTagMapModel = require('./AstTagMap.js')

const UsrTagModel = require('./UsrTag.js')
const UsrTagMapModel = require('./UsrTagMap.js')

const AdminModel = require('./Admin.js');
const EventModel = require('./Event.js');
const RemarkModel = require('./Rmk.js');
const LoanModel = require('./Loan.js');

const DeptModel = require('./Dept.js');
const UserModel = require('./Usr.js');

const AssetTypeModel = require('./AstType.js');
const AssetTypeVariantModel = require('./AstSType.js');
const VendorModel = require('./Vendor.js');
const AssetModel = require('./Ast.js');
const AssetLoanModel = require('./AstLoan.js');

const AccessoryTypeModel = require('./AccType.js');
const AccessoryTxnModel = require('./AccTxn.js');
const AccessoryLoanModel = require('./AccLoan.js');
const AccessoryReturnModel = require('./AccReturn.js');

const SubTypeAccessoryModel = require('./AstSTypeAcc.js');
const TypeAccessoryModel = require('./AstTypeAcc.js');

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {...config, logging: (msg) => logger.info(msg)});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {...config, logging: (msg) => logger.info(msg)});
}

const db = {
  AstTag: AstTagModel(sequelize),
  AstTagMap: AstTagMapModel(sequelize),

  UsrTag: UsrTagModel(sequelize),
  UsrTagMap: UsrTagMapModel(sequelize),

  Admin: AdminModel(sequelize),
  Event: EventModel(sequelize),
  Rmk: RemarkModel(sequelize),
  Loan: LoanModel(sequelize),

  Dept: DeptModel(sequelize),
  Usr: UserModel(sequelize),

  AstType: AssetTypeModel(sequelize),
  AstSType: AssetTypeVariantModel(sequelize),
  Vendor: VendorModel(sequelize),
  Ast: AssetModel(sequelize),
  AstLoan: AssetLoanModel(sequelize),

  AccType: AccessoryTypeModel(sequelize),
  AccTxn: AccessoryTxnModel(sequelize),
  AccLoan: AccessoryLoanModel(sequelize),
  AccReturn: AccessoryReturnModel(sequelize),

  AstSTypeAcc: SubTypeAccessoryModel(sequelize),
  AstTypeAcc: TypeAccessoryModel(sequelize)
};

// TAGS
db.Ast.hasMany(db.AstTagMap, { foreignKey: 'assetId' })
db.AstTagMap.belongsTo(db.Ast, { foreignKey: 'assetId', targetKey: 'id' })

db.AstTag.hasMany(db.AstTagMap, { foreignKey: 'tagId' })
db.AstTagMap.belongsTo(db.AstTag, { foreignKey: 'tagId', targetKey: 'id' })

db.Event.hasOne(db.AstTagMap, { as: 'AddedAstTag', foreignKey: 'addEventId' });
db.Event.hasOne(db.AstTagMap, { as: 'DeletedAstTag', foreignKey: 'delEventId' });
db.AstTagMap.belongsTo(db.Event, { as: 'AddEvent', foreignKey: 'addEventId' });
db.AstTagMap.belongsTo(db.Event, { as: 'DeleteEvent', foreignKey: 'delEventId' });

db.Usr.hasMany(db.UsrTagMap, { foreignKey: 'userId' })
db.UsrTagMap.belongsTo(db.Usr, { foreignKey: 'userId', targetKey: 'id' })

db.UsrTag.hasMany(db.UsrTagMap, { foreignKey: 'tagId' })
db.UsrTagMap.belongsTo(db.UsrTag, { foreignKey: 'tagId', targetKey: 'id' })

db.Event.hasOne(db.UsrTagMap, { as: 'AddedUsrTag', foreignKey: 'addEventId' });
db.Event.hasOne(db.UsrTagMap, { as: 'DeletedUsrTag', foreignKey: 'delEventId' });
db.UsrTagMap.belongsTo(db.Event, { as: 'AddEvent', foreignKey: 'addEventId' });
db.UsrTagMap.belongsTo(db.Event, { as: 'DeleteEvent', foreignKey: 'delEventId' });

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
db.AccType.hasMany(db.AccTxn, { foreignKey: 'accessoryTypeId' });
db.AccTxn.belongsTo(db.AccType, { foreignKey: 'accessoryTypeId', targetKey: 'id' });

// LOANS
db.AccType.hasMany(db.AccLoan, { foreignKey: 'accessoryTypeId' });
db.AccLoan.belongsTo(db.AccType, { foreignKey: 'accessoryTypeId', targetKey: 'id' });

db.Ast.hasMany(db.AstLoan, { foreignKey: 'assetId' });
db.AstLoan.belongsTo(db.Ast, { foreignKey: 'assetId', targetKey: 'id' });

db.Usr.hasMany(db.Loan, { foreignKey: 'userId' });
db.Loan.belongsTo(db.Usr, { foreignKey: 'userId', targetKey: 'id' });

db.Loan.hasOne(db.AstLoan, { foreignKey: 'loanId' });
db.AstLoan.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' }); // TODO remove?

db.Loan.hasMany(db.AccLoan, { foreignKey: 'loanId' });
db.AccLoan.belongsTo(db.Loan, { foreignKey: 'loanId', targetKey: 'id' }); // TODO remove?

db.AccLoan.hasMany(db.AccReturn, { foreignKey: 'accLoanId' });
db.AccReturn.belongsTo(db.AccLoan, { foreignKey: 'accLoanId', targetKey: 'id' }); // TODO remove?

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

db.Event.hasOne(db.AstLoan, { as: 'AssetReturn', foreignKey: 'returnEventId' })
db.AstLoan.belongsTo(db.Event, { as: 'ReturnEvent', foreignKey: 'returnEventId' });
db.Event.hasMany(db.AccReturn, { as: 'AccReturns', foreignKey: 'returnEventId' })
db.AccReturn.belongsTo(db.Event, { as: 'ReturnEvent', foreignKey: 'returnEventId' });

db.Event.hasOne(db.Ast, { as: 'AddedAsset', foreignKey: 'addEventId' });
db.Event.hasOne(db.Ast, { as: 'DeletedAsset', foreignKey: 'delEventId' });
db.Ast.belongsTo(db.Event, { as: 'AddEvent', foreignKey: 'addEventId' });
db.Ast.belongsTo(db.Event, { as: 'DeleteEvent', foreignKey: 'delEventId' });
db.Event.hasOne(db.Usr, { as: 'AddedUser', foreignKey: 'addEventId' });
db.Event.hasOne(db.Usr, { as: 'DeletedUser', foreignKey: 'delEventId' });
db.Usr.belongsTo(db.Event, { as: 'AddEvent', foreignKey: 'addEventId' });
db.Usr.belongsTo(db.Event, { as: 'DeleteEvent', foreignKey: 'delEventId' });

db.Event.hasOne(db.AccType, { foreignKey: 'addEventId' });
db.AccType.belongsTo(db.Event, { foreignKey: 'addEventId', targetKey: 'id' });
db.Event.hasOne(db.AccTxn, { foreignKey: 'eventId' });
db.AccTxn.belongsTo(db.Event, { foreignKey: 'eventId', targetKey: 'id' });

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
