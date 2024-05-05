const { sequelize, Vendor, Dept, User, AssetType, AssetTypeVariant, Asset, Event } = require('../models');
const FormHelpers = require('./formHelperController')
const uuid = require('uuid');

// req.file.filename, // Accessing the filename
// req.file.path,     // Accessing the full path
// req.file.size,     // Accessing the file size
// req.file.mimetype  // Accessing the MIME type

exports.loan = async (req, res) => {
    const filePath = req.file ? req.file.path : null;
    const userId = req.body.userId
    const assetId = req.body.assetId

    // TODO i think not needed bc filefilter alr checks...
    if (!filePath && req.fileValidationError) {
        return res.status(400).json({ error: 'Only PDF files are allowed!' });
    }

    try {
        await sequelize.transaction(async (transaction) => {
            const asset = await Asset.findByPk(assetId, { 
                attributes: ['status'],
                transaction: transaction
            });                
            if (!asset) {
                throw new Error(`Asset ${asset.assetId} not found!`);
            }
            if (asset.status === 'loaned') {
                throw new Error("Asset is still on loan!");
            }
            if (asset.status === 'condemned') {
                throw new Error("Asset tag is already condemned!");
            }
            await FormHelpers.insertAssetEvent(uuid.v4(), assetId, 'loaned', remarks, userId, null, filePath, transaction);
            await FormHelpers.updateStatus(assetId, 'loaned', userId, transaction);
        })
    
        return res.json({ message: 'All assets processed successfully.' });
    } catch (error) {
        console.error("Transaction failed:", error);
        return res.status(500).json({ error: error.message });
    }
}

exports.return = async (req, res) => {
    const filePath = req.file ? req.file.path : null;
    const userId = req.body.userId
    const assetId = req.body.assetId

    // TODO i think not needed bc filefilter alr checks...
    if (!filePath && req.fileValidationError) {
        return res.status(400).json({ error: 'Only PDF files are allowed!' });
    }

    const assets = req.body.assets; // TODO SET AS DICT

    console.log(assets);
    try {
        await sequelize.transaction(async (transaction) => {
            const asset = await Asset.findByPk(assetId, { 
                attributes: ['status'],
                transaction: transaction
            });                
            if (!asset) {
                return res.status(400).json({ error: "Asset not found!" });
            }
            if (asset.status !== "loaned") {
                return res.status(400).json({ error: "Asset is not on loan!" });
            }
            await FormHelpers.insertAssetEvent(uuid.v4(), assetId, 'returned', remarks, userId, null, filePath, transaction);
            await FormHelpers.updateStatus(assetId, 'available', transaction);
            processedIds.add(assetId);
        })

        return res.json({ message: 'All assets processed successfully.' });
        // res.json({ lastProcessedAssetId: assets[assets.length - 1].assetId }); // TODO IMPT did i just submit a single device as an array itself?
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.downloadEvent = async (req, res) => {
    const eventId = req.body.eventId;

    try {
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).send('File not found.');
        }

        const filePath = path.join(uploadPath, event.filePath);
        console.log(filePath);

        res.download(filePath, event.filePath, { headers: { 'Content-Type': 'application/pdf' } });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};