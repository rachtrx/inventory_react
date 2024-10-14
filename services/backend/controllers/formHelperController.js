const { Ast } = require('../models/postgres');
// const { Event } = require('../models/mongo');

class FormHelperController {

    // Function to insert a device event
    async insertAssetEvent (id, assetId, eventType, remarks, userId = null, eventDate = null, filePath = null, session = null) {
        try {
            const event = new Event({
                _id: id,
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
    async insertUserEvent (id, eventType, userId, remarks, eventDate = null, session = null) {
        try {
            const event = new Event({
                _id: id,
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
    async updateStatus (assetId, eventType, userId = null, session = null) {
        try {
            const options = {
                session: session
            };
            const result = await Ast.findByIdAndUpdate(
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
}

module.exports = new FormHelperController();