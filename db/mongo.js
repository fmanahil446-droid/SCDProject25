// db/mongo.js
const mongoose = require('mongoose');
require("dotenv").config(); // Load .env variables

// Use a local MongoDB URI
const mongoURI = 'mongodb://127.0.0.1:27017/nodevault'; // <-- this must not be undefined

function connectMongo() {
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('✅ MongoDB connected');
    }).catch(err => {
        console.error('MongoDB Connection Failed:', err);
    });
}

module.exports = connectMongo;
