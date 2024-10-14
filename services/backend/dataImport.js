const db = require('./models/postgres');
const data = require('./data_export.json');
const fs = require('fs');
const { generateSecureID } = require('./utils/nanoidValidation');

// console.log(Object.keys(data));

async function main(data) {
    

    const mappingDict = {}

    for (let key in data) {
        const dataset = data[key];
        dataset.forEach(item => {
            mappingDict[item.id] = generateSecureID();
        });
    }

    fs.writeFileSync('data.json', JSON.stringify(mappingDict, null, 4));

    function convertIdsInDataset(dataset) {
		return dataset.map(item => ({
			...item,
			id: mappingDict[item.id],
			...(item.vendorId && {vendorId: mappingDict[item.vendorId]}),
			...(item.assetTypeId && {assetTypeId: mappingDict[item.assetTypeId]}),
			...(item.assetId && {assetId: mappingDict[item.assetId]}),
			...(item.userId && {userId: mappingDict[item.userId]}),
			...(item.subTypeId && {subTypeId: mappingDict[item.subTypeId]}),
			...(item.deptId && {deptId: mappingDict[item.deptId]}),
		}));
	}

    newData = {}
	newData.device_types = convertIdsInDataset(data.device_types);
	newData.models = convertIdsInDataset(data.models);
	newData.vendors = convertIdsInDataset(data.vendors);
    newData.devices = convertIdsInDataset(data.devices);
    newData.depts = convertIdsInDataset(data.depts);
	newData.users = convertIdsInDataset(data.users);
	newData.events = convertIdsInDataset(data.events);

    const createEvent = (id, date) => ({
        id: id,
        eventDate: date
    })

    const eventsArr = []
    
    const newUsers = newData.users.map(user => {
        const { registeredDate, hasResigned, ...rest } = user;
    
        let addUserEvent = null;
        let delUserEvent = null;
    
        const addUserEvents = newData.events.filter(event => event.eventType === 'created' && event.userId === user.id);
    
        if (addUserEvents.length !== 1) {
            throw new Error(`${addUserEvents.length} add user events found for ${user.userName}`);
        }
    
        addUserEvent = addUserEvents[0]
        eventsArr.push(createEvent(addUserEvent.id, addUserEvent.eventDate))
    
        const delUserEvents = newData.events.filter(event => event.eventType === 'removed' && event.userId === user.id);
    
        if (delUserEvents.length > 1) {
            throw new Error(`${delUserEvents.length} del user events found for ${user.userName}`);
        }
    
        if (delUserEvents.length === 1) {
            delUserEvent = delUserEvents[0]
            eventsArr.push(createEvent(delUserEvent.id, delUserEvent.eventDate))
        }
    
        const newUser = {
            ...rest,
            addEventId: addUserEvent.id,
            deleteEventid: delUserEvent && delUserEvent.id || null
        };
    
        return newUser;
    });
    
    const newAssets = newData.devices
        .map(asset => {
    
            const { registeredDate, status, userId, ...rest } = asset;
    
            let addAssetEvent = null;
            let delAssetEvent = null;
        
            const addAssetEvents = newData.events.filter(event => event.eventType === 'registered' && event.assetId === asset.id);

            // console.log(addAssetEvents)
        
            if (addAssetEvents.length !== 1) {
                throw new Error(`add asset event for ${asset.assetTag} is not 1`);
            }
        
            addAssetEvent = addAssetEvents[0]
            eventsArr.push(createEvent(addAssetEvent.id, addAssetEvent.eventDate))
        
            const delAssetEvents = newData.events.filter(event => event.eventType === 'condemned' && event.assetId === asset.id);
        
            if (delAssetEvents.length > 1) {
                throw new Error(`More than 1 del asset event for ${asset.assetTag}`);
            }
        
            if (delAssetEvents.length === 1) {
                delAssetEvent = delAssetEvents[0]
                eventsArr.push(createEvent(delAssetEvent.id, delAssetEvent.eventDate))
            }
    
            const newAsset = {
                ...rest,
                addEventId: addAssetEvent.id,
                deleteEventid: delAssetEvent && delAssetEvent.id || null
            };
            return newAsset;
        });
   
    const remarksArr = []
    const userLoansArr = []
    const assetLoansArr = []
    const loansArr = []
    
    newData.events.forEach(event => {
    
        if (event.remarks) {
            remarksArr.push({
                id: generateSecureID(),
                eventId: event.id,
                text: event.remarks,
                remarkDate: event.eventDate
            })
        }
    })
    
    const sortedTransactionEvents = newData.events.filter((event) => (event.eventType === 'loaned' || event.eventType === 'returned')).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
    
    trackedAssetIds = {}
    
    sortedTransactionEvents.forEach((event) => {
    
        const {assetId=null, userId=null, eventType} = event;
        if (!assetId || !userId) throw new Error(`No Ast ID or Usr ID found!`);
    
        if (!trackedAssetIds[event.assetId]) {
            if (eventType === 'loaned') {
                trackedAssetIds[event.assetId] = event;
            } else throw new Error(`2 returns found in a row for ${assetId}`)
        } else if (eventType === 'loaned') {
            throw new Error(`2 loans found in a row for ${assetId}`)
        } else {
            const loanEvent = trackedAssetIds[event.assetId];
            const returnEvent = event;
    
            if (loanEvent.userId !== returnEvent.userId) throw new Error(`Loan Usr ID ${loanEvent.userId} is not the same as Return Usr ID ${returnEvent.userId}`);

            eventsArr.push(createEvent(loanEvent.id, loanEvent.eventDate))
            eventsArr.push(createEvent(returnEvent.id, returnEvent.eventDate))
            
            const loanId = generateSecureID();

            loansArr.push({
                id: loanId,
                loanEventId: loanEvent.id,
            })

            const userLoanId = generateSecureID();

            userLoansArr.push({
                id: userLoanId,
                loanId: loanId,
                userId: loanEvent.userId,
                filepath: returnEvent.filepath && returnEvent.filepath !== '' ? returnEvent.filepath : loanEvent.filepath,
            })
    
            assetLoansArr.push({
                id: generateSecureID(),
                loanId: loanId,
                assetId: assetId,
                returnEventId: returnEvent.id
            });
    
            delete trackedAssetIds[event.assetId]
        }
    })
    
    for (const [assetId, loanEvent] of Object.entries(trackedAssetIds)) {
        const {id, userId} = loanEvent;

        eventsArr.push(createEvent(loanEvent.id, loanEvent.eventDate))

        const loanId = generateSecureID();

        loansArr.push({
            id: loanId,
            loanEventId: loanEvent.id,
        })
    
        const userLoanId = generateSecureID();
        userLoansArr.push({
            id: userLoanId,
            loanId: loanId,
            userId: userId,
            filepath: loanEvent.filepath,
        })
    
        assetLoansArr.push({
            id: generateSecureID(),
            loanId: loanId,
            assetId: assetId,
        });
    }
    
    async function importData() {
        await db.sequelize.sync({ force: true }); // Not needed to drop any tables...
        await db.Event.bulkCreate(eventsArr);
        await db.Dept.bulkCreate(newData.depts);
        await db.Usr.bulkCreate(newUsers);
        await db.AstType.bulkCreate(newData.device_types);
        await db.AstSType.bulkCreate(newData.models);
        await db.Vendor.bulkCreate(newData.vendors);
        await db.Ast.bulkCreate(newAssets);
        await db.Rmk.bulkCreate(remarksArr);
        await db.Loan.bulkCreate(loansArr);
        await db.UsrLoan.bulkCreate(userLoansArr);
        await db.AstLoan.bulkCreate(assetLoansArr);
    }
    
    importData().then(() => {
        console.log('Postgres Data import complete.')
    }).catch(error => {
        console.error('Failed to import Postgres data:', error)
        process.exit(1);
    });
}

main(data);

// MONGO

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
// 		loanId: event.id,
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


