const { Asset } = require('../models/postgres'); // Adjust the path to your models
const { Event } = require('../models/mongo')

// Function to insert a device event
<<<<<<< HEAD
exports.insertAssetEvent = async (id, assetId, eventType, remarks, userId = null, eventDate = null, filePath = null, session = null) => {
    try {
        const event = new Event({
            _id: id,
=======
exports.insertAssetEvent = async (eventId, assetId, eventType, remarks, userId = null, eventDate = null, filePath = null, session = null) => {
    try {
        const event = new Event({
            _id: eventId,
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
            assetId: assetId,
            eventType: eventType,
            remarks: remarks,
            userId: userId,
            eventDate: eventDate,
            filePath: filePath
        });
        await event.save({ session: session });
        return event;
    } catch (error) {
        console.error("Error inserting device event:", error);
        throw error;
    }
};

// Function to insert a user event
<<<<<<< HEAD
exports.insertUserEvent = async (id, eventType, userId, remarks, eventDate = null, session = null) => {
    try {
        const event = new Event({
            _id: id,
=======
exports.insertUserEvent = async (eventId, eventType, userId, remarks, eventDate = null, session = null) => {
    try {
        const event = new Event({
            _id: eventId,
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
            eventType: eventType,
            userId: userId,
            remarks: remarks,
            eventDate: eventDate
        });
        await event.save({ session: session });
        return event;
    } catch (error) {
        console.error("Error inserting user event:", error);
        throw error;
    }
};

// Function to update asset status
exports.updateStatus = async (assetId, eventType, userId = null, session = null) => {
    try {
        const options = {
            session: session
        };
        const result = await Asset.findByIdAndUpdate(
            assetId,
            { status: eventType, userId: userId },
            options
        );
        return result;
    } catch (error) {
        console.error("Error updating asset status:", error);
        throw error;
    }
};
