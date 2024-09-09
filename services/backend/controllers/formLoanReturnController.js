const { sequelize, Vendor, Department, User, AssetType, AssetTypeVariant, Asset } = require('../models/postgres');
const FormHelpers = require('./formHelperController.js');
const { Event } = require('../models/mongo');
const { nanoid } = require('nanoid');
const logger = require('../logging.js');

// req.file.filename, // Accessing the filename
// req.file.path,     // Accessing the full path
// req.file.size,     // Accessing the file size
// req.file.mimetype  // Accessing the MIME type

class FormLoanReturnController {

    async loan (req, res) {
        console.log(req.body);
        const { signature, ...otherFormData } = req.body;

        let filePath = null;
    
        if (signature) {
            // Decode base64 string
            const base64Data = signature.replace(/^data:image\/png;base64,/, '');
    
            // Create a unique file name
            const fileName = `${Date.now()}-signature.png`;
    
            // Define the path to save the file
            const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
            filePath = path.join(uploadsDir, 'signatures', fileName);
    
            // Save the file to the server
            fs.writeFile(filePath, base64Data, 'base64', (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to save signature' });
                }
    
                // You might want to save the file path or URL in the database
                // Example: await database.saveSignaturePath(filePath, otherFormData.userId);
    
                res.status(200).json({ message: 'Signature saved successfully', filePath });
            });
        }

        const userId = otherFormData.userId;
        const assetId = otherFormData.assetId;
    
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const asset = await Asset.findById(assetId).session(session);
            if (!asset) {
                throw new Error(`Asset ${assetId} not found!`);
            }
            if (asset.status === 'loaned') {
                throw new Error("Asset is still on loan!");
            }
            if (asset.status === 'condemned') {
                throw new Error("Asset tag is already condemned!");
            }
            await FormHelpers.insertAssetEvent(nanoid(), assetId, 'loaned', otherFormData.remarks, userId, null, filePath, session);
            await FormHelpers.updateStatus(assetId, 'loaned', userId, session);
    
            await session.commitTransaction();
            session.endSession();
    
            return res.json({ message: 'All assets processed successfully.' });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction failed:", error);
            return res.status(500).json({ error: error.message });
        }
    };
    
    async return (req, res) {
        const filePath = req.file ? req.file.path : null;
        const userId = req.body.userId;
        const assetId = req.body.assetId;
    
        // TODO i think not needed bc filefilter alr checks...
        if (!filePath && req.fileValidationError) {
            return res.status(400).json({ error: 'Only PDF files are allowed!' });
        }
    
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const asset = await Asset.findById(assetId).session(session);
            if (!asset) {
                return res.status(400).json({ error: "Asset not found!" });
            }
            if (asset.status !== "loaned") {
                return res.status(400).json({ error: "Asset is not on loan!" });
            }
            await FormHelpers.insertAssetEvent(nanoid(), assetId, 'returned', req.body.remarks, userId, null, filePath, session);
            await FormHelpers.updateStatus(assetId, 'available', userId, session);
    
            await session.commitTransaction();
            session.endSession();
    
            return res.json({ message: 'All assets processed successfully.' }); 
            // res.json({ lastProcessedAssetId: assets[assets.length - 1].assetId }); // TODO IMPT did i just submit a single device as an array itself?
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction failed:", error);
            return res.status(500).json({ error: error.message });
        }
    };
    
    async downloadEvent (req, res) {
        const id = req.body.id;
    
        try {
            const event = await Event.findById(id);
            if (!event) {
                return res.status(404).send('File not found.');
            }
    
            const filePath = path.join(uploadPath, event.filePath);
            console.log(filePath);
    
            res.download(filePath, event.filePath, { headers: { 'Content-Type': 'application/pdf' } });
        } catch (error) {
            console.error("Error downloading file:", error);
            res.status(500).send('Internal Server Error');
        }
    };
}

module.exports = new FormLoanReturnController();
