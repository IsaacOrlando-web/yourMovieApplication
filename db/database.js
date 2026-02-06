const {MongoClient} = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const databaseUser = process.env.DATABASE_USER;
const dbPassword = process.env.DATABASE_PASSWORD;
const uri = `mongodb+srv://${databaseUser}:${dbPassword}@cluster0.gkt5des.mongodb.net/`;
const client = new MongoClient(uri);

let database;

async function initDB() {
    try {
        await client.connect();
        database = client.db('yourMovies');
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error(e);
    } 
}

function getDatabase() {
    return database;
}

module.exports = { initDB, getDatabase };