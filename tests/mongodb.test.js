const { initDB, getDatabase, closeDB } = require('../db/database');

describe('Insert', () => {
    let connection;
    let db;

    beforeAll(async () => {
        connection = await initDB();
        db = getDatabase();
    });

    afterAll(async () => {
        await closeDB();
    });

    it('Should insert a doc into collection', async() => {
        const movies = db.collection('movies');

        const mockMovie = {_id: 'some-id', name: 'The Matrix 4'};
        await movies.insertOne(mockMovie);

        const insertedMovie = await movies.findOne({_id: 'some-id'});
        expect(insertedMovie).toEqual(mockMovie);
    });

    it('should update a doc in collection', async() => {
        const movies = db.collection('movies');

        const query = { _id: 'some-id'};
        const update = { $set: { name: 'The Matrix Resurrections' } };
        const options = {};
        await movies.updateOne(query, update, options);

        const updatedMovie = await movies.findOne({_id: 'some-id'});
        expect(updatedMovie.name).toEqual('The Matrix Resurrections');
    });
});