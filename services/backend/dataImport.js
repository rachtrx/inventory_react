const db = require('./models/postgres'); // Adjust the path as necessary to import your Sequelize models
const data = require('./data_export.json'); // The path to your JSON file

const removedEvents = data.events.filter(event => event.eventType === 'removed');

const eventDateByUserId = removedEvents.reduce((acc, { userId, eventDate }) => {
	acc[userId] = eventDate;
	return acc;
}, {});

const transformedUsers = data.users.map(user => {
	const { registeredDate, hasResigned, ...rest } = user;

	const newUser = {
			...rest,
			addedDate: registeredDate,
			deletedDate: eventDateByUserId[user.id] || null
	};

	return newUser;
});

const condemnedEvents = data.events.filter(event => event.eventType === 'condemned');

const eventDateByAssetId = condemnedEvents.reduce((acc, { assetId, eventDate }) => {
	acc[assetId] = eventDate;
	return acc;
}, {});

const transformedAssets = data.devices.map(asset => {
	const { registeredDate, status, ...rest } = asset;

	const newAsset = {
			...rest,
			addedDate: registeredDate,
			deletedDate: eventDateByAssetId[asset.id] || null
	};

	return newAsset;
});

async function importData() {
    await db.sequelize.sync({ force: true }); // Not needed to drop any tables...
    await db.Admin.bulkCreate(data.admins);
    await db.Dept.bulkCreate(data.depts);
    await db.User.bulkCreate(transformedUsers);
    await db.AssetType.bulkCreate(data.device_types);
    await db.AssetTypeVariant.bulkCreate(data.models);
    await db.Vendor.bulkCreate(data.vendors);
    await db.Asset.bulkCreate(transformedAssets);
}

importData().then(() => {
	console.log('Postgres Data import complete.')
}).catch(error => {
	console.error('Failed to import Postgres data:', error)
	process.exit(1);
});

// MONGO

const mongodb = require('./models/mongo');

mongodb.connectDB()

const eventTypeMap = {
	'registered': 'ADD',
	'loaned': 'LOAN',
	'returned': 'RETURN',
	'condemned': 'DEL',
	'created': 'ADD',
	'removed': 'DEL',
}

async function migrateEvents() {

  for (let event of data.events) {

		const remarksArray = event.remarks ? [{
      text: event.remarks,
      remarkedAt: event.eventDate
    }] : [];

		const eventType = eventTypeMap[event.eventType]

    const newEvent = await mongodb.Event.create({
      ...event.assetId && { assetId: event.assetId },
    	...event.userId && { userId: event.userId },
      eventType: eventType,
      remarks: remarksArray,
      eventDate: event.eventDate,
      filePath: event.filepath, // filepath changed to filePath
    });

		// Update createdAt and updatedAt to match eventDate after creation
    await mongodb.Event.updateOne({ _id: newEvent._id }, {
      $set: {
        createdAt: event.eventDate,
        updatedAt: event.eventDate
      }
    });
  }
}

async function runMigration() {
	try {
		await migrateEvents();
		console.log('Mongo Data import complete.')
		process.exit(0);
	} catch (error) {
		console.error('Failed to import Mong0 data:', error)
		process.exit(1);
	}
}

runMigration();


// Event.find({ userId: 'specificUserId' })
//      .sort({ eventDate: -1 })
//      .then(events => console.log('Events for User:', events));

// // Query to get all events for a specific asset, sorted by date
// Event.find({ assetId: 'specificAssetId' })
//      .sort({ eventDate: -1 })
//      .then(events => console.log('Events for Asset:', events));

// async function createData(Event, User, Asset) {
// 	// Create an event
// 	const event = await Event.create({ name: 'Conference', date: new Date(), details: 'Annual conference' });

// 	// Create a user and link to the event
// 	const user = await User.create({ name: 'John Doe', email: 'john@example.com', events: [event._id] });

// 	// Create an asset and link to the same event
// 	const asset = await Asset.create({ name: 'Laptop', type: 'Electronics', events: [event._id] });

// 	console.log('Data created:', { user, asset });
// }
  
// createData(Event, User, Asset).catch(console.error);

// async function fetchUsers() {
//   const users = await User.find().populate('events');
//   console.log('Users:', users);
// }

// fetchUsers().catch(console.error);

