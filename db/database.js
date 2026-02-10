const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const client = new MongoClient(process.env.MONGO_DB_CONNECTION_STRING);

let database;

async function initDB() {
    if (database) {
        return; // Already connected — skip
    }
    try {
        await client.connect();
        database = client.db('yourMovies');
        console.log('Connected to MongoDB');
    } catch (e) {
        console.error('Failed to connect to MongoDB:', e);
        throw e; // Propagate so the caller knows startup failed
    }
}

function getDatabase() {
    if (!database) {
        throw new Error('Database not initialized. Call initDB() first.');
    }
    return database;
}

module.exports = { initDB, getDatabase };