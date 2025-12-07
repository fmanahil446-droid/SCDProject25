// db/mongo.js
const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://nodevault-mongo:27017/nodevault';

function connectMongo() {
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1); // Exit container if DB connection fails
    });
}

module.exports = connectMongo;

