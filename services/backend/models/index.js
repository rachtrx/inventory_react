'use strict';

const Sequelize = require('sequelize');
const process = require('process');
console.log(process.env.NODE_ENV);
const logger = require('../logging.js');

const AstTagModel = require('./AstTag.js')
const AstTagMapModel = require('./AstTagMap.js')
const AstTagMapDelModel = require('./AstTagMapDel.js')

const UsrTagModel = require('./UsrTag.js')
const UsrTagMapModel = require('./UsrTagMap.js')
const UsrTagMapDelModel = require('./UsrTagMapDel.js')

const AdminModel = require('./Admin.js');
const EventModel = require('./Event.js');
const RemarkModel = require('./Rmk.js');
const LoanModel = require('./Loan.js');

const DeptModel = require('./Dept.js');
const UserModel = require('./Usr.js');
const UserDelModel = require('./UsrDelete.js');

const AssetTypeModel = require('./AstType.js');
const AssetTypeVariantModel = require('./AstSType.js');
const VendorModel = require('./Vendor.js');
const AssetModel = require('./Ast.js');
const AssetDelModel = require('./AstDelete.js');
const AssetLoanModel = require('./AstLoan.js');
const AssetReturnModel = require('./AstReturn.js');

const AccessoryTypeModel = require('./AccType.js');
const AccessoryTxnModel = require('./AccTxn.js');
const AccessoryLoanModel = require('./AccLoan.js');
const AccessoryReturnModel = require('./AccReturn.js');

const SubTypeAccessoryModel = require('./AstSTypeAcc.js');
const TypeAccessoryModel = require('./AstTypeAcc.js');

const config = {
  "username": process.env.POSTGRES_USER,
  "password": process.env.POSTGRES_PASSWORD,
  "database": process.env.POSTGRES_DB,
  "host": process.env.DATABASE_HOST,
  "port": process.env.DATABASE_PORT || 5432,
  "dialect": "postgres",
  "define": {
    "underscored": true
  },
}

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {...config, logging: (msg) => logger.info(msg)});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {...config, logging: (msg) => logger.info(msg)});
}

const db = {
  AstTag: AstTagModel(sequelize),
  AstTagMap: AstTagMapModel(sequelize),
  AstTagMapDel: AstTagMapDelModel(sequelize),

  UsrTag: UsrTagModel(sequelize),
  UsrTagMap: UsrTagMapModel(sequelize),
  UsrTagMapDel: UsrTagMapDelModel(sequelize),

  Admin: AdminModel(sequelize),
  Event: EventModel(sequelize),
  Rmk: RemarkModel(sequelize),
  Loan: LoanModel(sequelize),

  Dept: DeptModel(sequelize),
  Usr: UserModel(sequelize),
  UsrDelete: UserDelModel(sequelize),

  AstType: AssetTypeModel(sequelize),
  AstSType: AssetTypeVariantModel(sequelize),
  Vendor: VendorModel(sequelize),
  Ast: AssetModel(sequelize),
  AstDelete: AssetDelModel(sequelize),
  AstLoan: AssetLoanModel(sequelize),
  AstReturn: AssetReturnModel(sequelize),

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

db.AstTagMap.hasMany(db.AstTagMapDel, { foreignKey: 'astTagMapId' })
db.AstTagMapDel.belongsTo(db.AstTagMap, { foreignKey: 'astTagMapId', targetKey: 'id' })

db.Usr.hasMany(db.UsrTagMap, { foreignKey: 'userId' })
db.UsrTagMap.belongsTo(db.Usr, { foreignKey: 'userId', targetKey: 'id' })
db.UsrTag.hasMany(db.UsrTagMap, { foreignKey: 'tagId' })
db.UsrTagMap.belongsTo(db.UsrTag, { foreignKey: 'tagId', targetKey: 'id' })

db.UsrTagMap.belongsTo(db.UsrTagMapDel, { foreignKey: 'usrTagMapId' })
db.UsrTagMapDel.belongsTo(db.UsrTagMap, { foreignKey: 'usrTagMapId', targetKey: 'id' })

// USERS
db.Dept.hasMany(db.Usr, { foreignKey: 'deptId' });
db.Usr.belongsTo(db.Dept, { foreignKey: 'deptId', targetKey: 'id' }); // IMPT JAVASCRIPT NAME

db.Usr.hasMany(db.UsrDelete, {foreignKey: 'userId'});
db.UsrDelete.belongsTo(db.Usr, { foreignKey: 'eventId' });

// ASSETS
db.AstType.hasMany(db.AstSType, { foreignKey: 'assetTypeId' });
db.AstSType.belongsTo(db.AstType, { foreignKey: 'assetTypeId', targetKey: 'id' });

db.AstSType.hasMany(db.Ast, { foreignKey: 'subTypeId' });
db.Ast.belongsTo(db.AstSType, { foreignKey: 'subTypeId', targetKey: 'id' });

db.Vendor.hasMany(db.Ast, { foreignKey: 'vendorId' });
db.Ast.belongsTo(db.Vendor, { foreignKey: 'vendorId', targetKey: 'id' });

db.Ast.hasMany(db.AstDelete, {foreignKey: 'assetId'});
db.AstDelete.belongsTo(db.Ast, { foreignKey: 'eventId' });

// ACCESSORIES
db.AccType.hasMany(db.AccTxn, { foreignKey: 'accessoryTypeId' });
db.AccTxn.belongsTo(db.AccType, { foreignKey: 'accessoryTypeId', targetKey: 'id' });

// LOANS
db.AccType.hasMany(db.AccLoan, { foreignKey: 'accessoryTypeId' });
db.AccLoan.belongsTo(db.AccType, { foreignKey: 'accessoryTypeId', targetKey: 'id' });

db.Ast.hasMany(db.AstLoan, { foreignKey: 'assetId' });
db.AstLoan.belongsTo(db.Ast, { foreignKey: 'assetId', targetKey: 'id' });

db.AstLoan.hasMany(db.AstReturn, { foreignKey: 'astLoanId' });
db.AstReturn.belongsTo(db.AstLoan, { foreignKey: 'astLoanId', targetKey: 'id' });

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
db.Event.hasOne(db.Loan, { foreignKey: 'eventId' });
db.Event.hasOne(db.AstReturn, { foreignKey: 'eventId' });
db.Event.hasMany(db.AccReturn, { foreignKey: 'eventId' });

db.Loan.belongsTo(db.Event, { foreignKey: 'eventId' });
db.AstReturn.belongsTo(db.Event, { foreignKey: 'eventId' });
db.AccReturn.belongsTo(db.Event, { foreignKey: 'eventId' });

db.Event.hasOne(db.Ast, { foreignKey: 'eventId' });
db.Event.hasOne(db.Usr, { foreignKey: 'eventId' });
db.Ast.belongsTo(db.Event, { foreignKey: 'eventId' });
db.Usr.belongsTo(db.Event, { foreignKey: 'eventId' });

db.Event.hasOne(db.AstDelete, { foreignKey: 'eventId' });
db.Event.hasOne(db.UsrDelete, { foreignKey: 'eventId' });
db.AstDelete.belongsTo(db.Event, { foreignKey: 'eventId' });
db.UsrDelete.belongsTo(db.Event, { foreignKey: 'eventId' });

db.Event.hasOne(db.AccType, { foreignKey: 'eventId' });
db.Event.hasOne(db.AccTxn, { foreignKey: 'eventId' });
db.AccType.belongsTo(db.Event, { foreignKey: 'eventId', targetKey: 'id' });
db.AccTxn.belongsTo(db.Event, { foreignKey: 'eventId', targetKey: 'id' });

db.Event.hasOne(db.AstTagMap, { foreignKey: 'eventId' });
db.Event.hasOne(db.AstTagMapDel, { foreignKey: 'eventId' });
db.Event.hasOne(db.UsrTagMap, { foreignKey: 'eventId' });
db.Event.hasOne(db.UsrTagMapDel, { foreignKey: 'eventId' });

db.AstTagMap.belongsTo(db.Event, { foreignKey: 'eventId', targetKey: 'id' });
db.AstTagMapDel.belongsTo(db.Event, { foreignKey: 'eventId', targetKey: 'id' });
db.UsrTagMap.belongsTo(db.Event, { foreignKey: 'eventId', targetKey: 'id' });
db.UsrTagMapDel.belongsTo(db.Event, { foreignKey: 'eventId', targetKey: 'id' });

// Event and Admin
db.Admin.hasMany(db.Event, { as: 'OpenedEvents', foreignKey: 'openedAdminId' })
db.Event.belongsTo(db.Admin, { as: 'OpenedAdmin', foreignKey: 'openedAdminId', targetKey: 'id' });

db.Admin.hasMany(db.Event, { as: 'ClosedEvents', foreignKey: 'closedAdminId' })
db.Event.belongsTo(db.Admin, { as: 'ClosedAdmin', foreignKey: 'closedAdminId', targetKey: 'id' });

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
