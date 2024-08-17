const db = require('./models/postgres'); // Adjust the path as necessary to import your Sequelize models
const data = require('./data_export.json'); // The path to your JSON file

<<<<<<< HEAD
function convertToUUIDv4(hexString) {
    // Ensure the string is 32 characters long and all hexadecimal
    if (hexString.length !== 32 || !/^[0-9a-fA-F]{32}$/.test(hexString)) {
        throw new Error('Invalid 128-bit value');
    }

    // Insert hyphens at the correct positions
    let uuid = [
        hexString.slice(0, 8),
        hexString.slice(8, 12),
        '4' + hexString.slice(13, 16), // Set the version to 4
        (parseInt(hexString[16], 16) & 0x3 | 0x8).toString(16) + hexString.slice(17, 20), // Set variant bits
        hexString.slice(20)
    ].join('-');

    return uuid;
}

function convertIdsInDataset(dataset) {
    return dataset.map(item => ({
        ...item,
        id: convertToUUIDv4(item.id)
    }));
}

data.depts = convertIdsInDataset(data.depts);
data.users = convertIdsInDataset(data.users);
data.device_types = convertIdsInDataset(data.device_types);
data.models = convertIdsInDataset(data.models);
data.vendors = convertIdsInDataset(data.vendors);
data.events = convertIdsInDataset(data.events);

=======
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
const removedEvents = data.events.filter(event => event.eventType === 'removed');

const eventDateByUserId = removedEvents.reduce((acc, { userId, eventDate }) => {
	acc[userId] = eventDate;
	return acc;
}, {});

<<<<<<< HEAD
const newUsers = data.users.map(user => {
=======
const transformedUsers = data.users.map(user => {
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
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

<<<<<<< HEAD
const loanEvents = []
const loanAssetEvents = []
const loanDetailEvents = []
const newAssets = []

data.devices
	.forEach(asset => {

		const { registeredDate, status, userId, id, ...rest } = asset;

		let eventId = null;

		if (userId) {
			const mostRecentLoanEvents = data.events
				.filter(event => 
					event.userId === userId && 
					event.assetId === id && 
					event.eventType === 'loaned'
				)
				.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

			eventId = mostRecentLoanEvents[0].id;
			const startDate = mostRecentLoanEvents[0].eventDate
			const newLoanEvent = {
				id: eventId,
			};

			const loanDetailEvent = {
				loanId: eventId,
				userId: userId,
				startDate: startDate,
				status: 'COMPLETED',
				eventId: eventId
			}
			loanEvents.push(newLoanEvent);
			loanDetailEvents.push(loanDetailEvent);
		}

		const newAsset = {
			...rest,
			id: id,
			addedDate: registeredDate,
			deletedDate: eventDateByAssetId[asset.id] || null,
			loanId: eventId,
		};
		newAssets.push(newAsset)
	});

async function importData() {
    await db.sequelize.sync({ force: true }); // Not needed to drop any tables...
    await db.Department.bulkCreate(data.depts);
    await db.User.bulkCreate(newUsers);
    await db.AssetType.bulkCreate(data.device_types);
    await db.AssetTypeVariant.bulkCreate(data.models);
    await db.Vendor.bulkCreate(data.vendors);
	await db.Loan.bulkCreate(loanEvents);
    await db.Asset.bulkCreate(newAssets);
	await db.AssetLoan.bulkCreate(loanAssetEvents);
	await db.LoanDetail.bulkCreate(loanDetailEvents);
=======
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
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
}

importData().then(() => {
	console.log('Postgres Data import complete.')
}).catch(error => {
	console.error('Failed to import Postgres data:', error)
	process.exit(1);
});

// MONGO

<<<<<<< HEAD
// const mongodb = require('./models/mongo');

// mongodb.connectDB()

// const eventTypeMap = {
// 	'registered': 'ADD',
// 	'loaned': 'LOAN',
// 	'returned': 'RETURN',
// 	'condemned': 'DEL',
// 	'created': 'ADD',
// 	'removed': 'DEL',
// }

// async function migrateEvents() {

//   for (let event of data.events) {

// 	const remarksArray = event.remarks ? [{
//       text: event.remarks,
//       remarkedAt: event.eventDate
//     }] : [];

// 	const eventType = eventTypeMap[event.eventType]

//     const newEvent = await mongodb.Event.create({
//       	...event.assetId && { assetId: event.assetId },
// 		...event.userId && { userId: event.userId },
// 		_id: event.id,
// 		eventType: eventType,
// 		remarks: remarksArray,
// 		eventDate: event.eventDate,
// 		filePath: event.filepath, // filepath changed to filePath
//     });

// 	// Update createdAt and updatedAt to match eventDate after creation
//     await mongodb.Event.updateOne({ _id: newEvent._id }, {
//       $set: {
//         createdAt: event.eventDate,
//         updatedAt: event.eventDate
//       }
//     });
//   }
// }

// async function runMigration() {
// 	try {
// 		await migrateEvents();
// 		console.log('Mongo Data import complete.')
// 		process.exit(0);
// 	} catch (error) {
// 		console.error('Failed to import Mong0 data:', error)
// 		process.exit(1);
// 	}
// }

// runMigration();

=======
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
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98

