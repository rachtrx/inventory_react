const Admin = require('./Admin')
const Event = require('./Event')

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/inventory_dev', { // TODO change to process.env.MONGO_URI
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

const mongodb = { Admin, Event, connectDB }
module.exports = mongodb
