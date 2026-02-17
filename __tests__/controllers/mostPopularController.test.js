const { ObjectId } = require('mongodb');
const { createMockCollection, createMockReqRes, validObjectId } = require('../helpers/mockDb');

const mockCollection = createMockCollection();
jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => ({
    collection: jest.fn(() => mockCollection),
  })),
}));

const {
  getAllPopular,
  getSinglePopular,
  addPopular,
  updatePopular,
  deletePopular,
} = require('../../controllers/mostPopularController');

const validPopularBody = {
  movieId: 'movie-123',
  title: 'Popular Movie',
  description: 'A very popular movie',
  genre: ['Action', 'Thriller'],
  releaseYear: 2024,
  director: 'Famous Director',
  duration: 150,
  rating: 9.2,
  posterUrl: 'https://example.com/poster.jpg',
  trailerUrl: 'https://example.com/trailer.mp4',
  cast: ['Star One', 'Star Two'],
  language: 'English',
  country: 'USA',
  addedDate: '2024-01-01',
  views: 50000,
  isPopular: true,
  copyrightStatus: 'Licensed',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET ALL POPULAR ───────────────────────────────────────────
describe('getAllPopular', () => {
  it('should return all popular movies with status 200', async () => {
    const movies = [{ _id: '1', title: 'Hit A' }, { _id: '2', title: 'Hit B' }];
    mockCollection._cursor.toArray.mockResolvedValue(movies);
    const { req, res } = createMockReqRes();

    await getAllPopular(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(movies);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
  });

  it('should return empty array when no popular movies exist', async () => {
    mockCollection._cursor.toArray.mockResolvedValue([]);
    const { req, res } = createMockReqRes();

    await getAllPopular(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 on database error', async () => {
    mockCollection._cursor.toArray.mockRejectedValue(new Error('DB error'));
    const { req, res } = createMockReqRes();

    await getAllPopular(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error retrieving movies' })
    );
  });
});

// ─── GET SINGLE POPULAR ────────────────────────────────────────
describe('getSinglePopular', () => {
  it('should return a popular movie by valid ObjectId', async () => {
    const id = validObjectId();
    const movie = { _id: new ObjectId(id), title: 'Popular Hit' };
    mockCollection.findOne.mockResolvedValue(movie);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSinglePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(movie);
  });

  it('should return 404 when popular movie is not found', async () => {
    const id = validObjectId();
    mockCollection.findOne.mockResolvedValue(null);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSinglePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
  });

  it('should fallback to string ID lookup', async () => {
    const id = validObjectId();
    const movie = { _id: id, title: 'String ID Popular' };
    mockCollection.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(movie);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSinglePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockCollection.findOne).toHaveBeenCalledTimes(2);
  });

  it('should handle non-ObjectId string IDs', async () => {
    const id = 'string-id';
    const movie = { _id: id, title: 'Custom Popular' };
    mockCollection.findOne.mockResolvedValue(movie);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSinglePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(movie);
  });

  it('should return 500 on database error', async () => {
    mockCollection.findOne.mockRejectedValue(new Error('DB error'));
    const { req, res } = createMockReqRes({ params: { id: 'abc' } });

    await getSinglePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── ADD POPULAR ───────────────────────────────────────────────
describe('addPopular', () => {
  it('should add a popular movie and return 201', async () => {
    const insertedId = new ObjectId();
    mockCollection.insertOne.mockResolvedValue({ insertedId });
    const { req, res } = createMockReqRes({ body: { ...validPopularBody } });

    await addPopular(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Movie added to most popular',
      id: insertedId,
    });
  });

  it('should return 400 when required fields are missing', async () => {
    const { req, res } = createMockReqRes({ body: { title: 'Only Title' } });

    await addPopular(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Missing required fields',
        missingFields: expect.arrayContaining(['movieId', 'description', 'genre']),
      })
    );
  });

  it('should return 400 when body is empty', async () => {
    const { req, res } = createMockReqRes({ body: {} });

    await addPopular(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        missingFields: expect.arrayContaining([
          'movieId', 'title', 'description', 'genre', 'releaseYear', 'director',
          'duration', 'rating', 'posterUrl', 'trailerUrl', 'cast',
          'language', 'country', 'addedDate', 'views', 'isPopular', 'copyrightStatus',
        ]),
      })
    );
  });

  it('should return 400 when a required field is null', async () => {
    const body = { ...validPopularBody, movieId: null };
    const { req, res } = createMockReqRes({ body });

    await addPopular(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ missingFields: ['movieId'] })
    );
  });

  it('should return 500 on database error', async () => {
    mockCollection.insertOne.mockRejectedValue(new Error('Insert failed'));
    const { req, res } = createMockReqRes({ body: { ...validPopularBody } });

    await addPopular(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── UPDATE POPULAR ────────────────────────────────────────────
describe('updatePopular', () => {
  it('should update a popular movie and return 204', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validPopularBody } });

    await updatePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 400 for invalid ObjectId', async () => {
    const { req, res } = createMockReqRes({
      params: { id: 'not-valid' },
      body: { ...validPopularBody },
    });

    await updatePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid movie ID format' });
  });

  it('should return 400 when required fields are missing', async () => {
    const id = validObjectId();
    const { req, res } = createMockReqRes({ params: { id }, body: {} });

    await updatePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Missing required fields' })
    );
  });

  it('should return 404 when popular movie to update is not found', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validPopularBody } });

    await updatePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
  });

  it('should return 500 on database error', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockRejectedValue(new Error('Update failed'));
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validPopularBody } });

    await updatePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── DELETE POPULAR ────────────────────────────────────────────
describe('deletePopular', () => {
  it('should delete a popular movie and return 204', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
    const { req, res } = createMockReqRes({ params: { id } });

    await deletePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 400 for invalid ObjectId', async () => {
    const { req, res } = createMockReqRes({ params: { id: 'bad' } });

    await deletePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid movie ID format' });
  });

  it('should return 404 when popular movie to delete is not found', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
    const { req, res } = createMockReqRes({ params: { id } });

    await deletePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
  });

  it('should return 500 on database error', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockRejectedValue(new Error('Delete failed'));
    const { req, res } = createMockReqRes({ params: { id } });

    await deletePopular(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
