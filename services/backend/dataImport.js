const db = require('./models'); // Adjust the path as necessary to import your Sequelize models
const data = require('./data_export.json'); // The path to your JSON file

async function importData() {
    // await db.sequelize.sync({ force: true }); // Not needed to drop any tables...
    await db.Admin.bulkCreate(data.admins);
    await db.Dept.bulkCreate(data.depts);
    await db.User.bulkCreate(data.users);
    await db.AssetType.bulkCreate(data.device_types);
    await db.AssetTypeVariant.bulkCreate(data.models);
    await db.Vendor.bulkCreate(data.vendors);
    await db.Asset.bulkCreate(data.devices);
    await db.Event.bulkCreate(data.events);
}

importData().then(() => console.log('Data import complete.')).catch(error => console.error('Failed to import data:', error));
