const { Event, Asset } = require('../models'); // Adjust the path to your models

// Function to insert a device event
exports.insertAssetEvent = async (eventId, assetId, eventType, remarks, userId = null, eventDate = null, filePath = null, transaction = null) => {
    try {
        const event = await Event.create({
            id: eventId,
            assetId: assetId,
            eventType: eventType,
            remarks: remarks,
            userId: userId,
            eventDate: eventDate,
            filepath: filePath
        }, { transaction: transaction }); // Include the transaction in the create options
        return event;
    } catch (error) {
        console.error("Error inserting device event:", error);
        throw error;
    }
}

// Function to insert a user event
exports.insertUserEvent = async (eventId, eventType, userId, remarks, eventDate = null, transaction = null) => {
    try {
        const event = await Event.create({
            id: eventId,
            eventType: eventType,
            userId: userId,
            remarks: remarks,
            eventDate: eventDate
        }, { transaction: transaction });
        return event;
    } catch (error) {
        console.error("Error inserting user event:", error);
        throw error;
    }
}

// Function to update asset status
exports.updateStatus = async (assetId, eventType, userId = null, transaction = null) => {
    try {
        // The options object should include both the `where` clause and `transaction`
        const options = {
            where: { id: assetId },
            transaction: transaction  // transaction is part of the options object
        };
        const [numAffectedRows, affectedRows] = await Asset.update(
            { status: eventType, userId: userId },
            options
        );
        return { numAffectedRows, affectedRows };
    } catch (error) {
        console.error("Error updating asset status:", error);
        throw error;
    }
}
