const { ObjectId } = require('mongodb');
const { createMockCollection, createMockReqRes, validObjectId } = require('../helpers/mockDb');

// Mock the database module
const mockCollection = createMockCollection();
jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => ({
    collection: jest.fn(() => mockCollection),
  })),
}));

const {
  getAllMovies,
  getSingleMovie,
  addMovie,
  updateMovie,
  deleteMovie,
} = require('../../controllers/moviesController');

// Valid movie body with all required fields
const validMovieBody = {
  title: 'Test Movie',
  description: 'A test movie description',
  genre: ['Action', 'Drama'],
  releaseYear: 2024,
  director: 'Test Director',
  duration: 120,
  rating: 8.5,
  posterUrl: 'https://example.com/poster.jpg',
  trailerUrl: 'https://example.com/trailer.mp4',
  cast: ['Actor One', 'Actor Two'],
  language: 'English',
  country: 'USA',
  addedDate: '2024-01-01',
  views: 1000,
  isPopular: true,
  copyrightStatus: 'Licensed',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET ALL MOVIES ────────────────────────────────────────────
describe('getAllMovies', () => {
  it('should return all movies with status 200', async () => {
    const movies = [{ _id: '1', title: 'Movie A' }, { _id: '2', title: 'Movie B' }];
    mockCollection._cursor.toArray.mockResolvedValue(movies);
    const { req, res } = createMockReqRes();

    await getAllMovies(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(movies);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
  });

  it('should return an empty array when no movies exist', async () => {
    mockCollection._cursor.toArray.mockResolvedValue([]);
    const { req, res } = createMockReqRes();

    await getAllMovies(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 on database error', async () => {
    mockCollection._cursor.toArray.mockRejectedValue(new Error('DB connection failed'));
    const { req, res } = createMockReqRes();

    await getAllMovies(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error retrieving movies' })
    );
  });
});

// ─── GET SINGLE MOVIE ──────────────────────────────────────────
describe('getSingleMovie', () => {
  it('should return a movie by valid ObjectId', async () => {
    const id = validObjectId();
    const movie = { _id: new ObjectId(id), title: 'Found Movie' };
    mockCollection.findOne.mockResolvedValue(movie);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(movie);
  });

  it('should return 404 when movie is not found', async () => {
    const id = validObjectId();
    mockCollection.findOne.mockResolvedValue(null);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
  });

  it('should fallback to string ID lookup when ObjectId lookup fails', async () => {
    const id = validObjectId();
    const movie = { _id: id, title: 'String ID Movie' };
    // First call (ObjectId lookup) returns null, second call (string lookup) returns movie
    mockCollection.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(movie);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(movie);
    expect(mockCollection.findOne).toHaveBeenCalledTimes(2);
  });

  it('should handle non-ObjectId string IDs', async () => {
    const id = 'not-an-objectid';
    const movie = { _id: id, title: 'String ID Movie' };
    mockCollection.findOne.mockResolvedValue(movie);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(movie);
  });

  it('should return 500 on database error', async () => {
    const id = 'some-id';
    mockCollection.findOne.mockRejectedValue(new Error('DB error'));
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error retrieving movie' })
    );
  });
});

// ─── ADD MOVIE ─────────────────────────────────────────────────
describe('addMovie', () => {
  it('should create a movie and return 201', async () => {
    const insertedId = new ObjectId();
    mockCollection.insertOne.mockResolvedValue({ insertedId });
    const { req, res } = createMockReqRes({ body: { ...validMovieBody } });

    await addMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Movie added successfully',
      insertedId,
    });
    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Movie' })
    );
  });

  it('should return 400 when required fields are missing', async () => {
    const { req, res } = createMockReqRes({ body: { title: 'Only Title' } });

    await addMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Missing required fields',
        missingFields: expect.arrayContaining(['description', 'genre', 'director']),
      })
    );
  });

  it('should return 400 when body is completely empty', async () => {
    const { req, res } = createMockReqRes({ body: {} });

    await addMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        missingFields: expect.arrayContaining([
          'title', 'description', 'genre', 'releaseYear', 'director',
          'duration', 'rating', 'posterUrl', 'trailerUrl', 'cast',
          'language', 'country', 'addedDate', 'views', 'isPopular', 'copyrightStatus',
        ]),
      })
    );
  });

  it('should return 400 when a required field is null', async () => {
    const body = { ...validMovieBody, title: null };
    const { req, res } = createMockReqRes({ body });

    await addMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        missingFields: expect.arrayContaining(['title']),
      })
    );
  });

  it('should return 500 on database error', async () => {
    mockCollection.insertOne.mockRejectedValue(new Error('Insert failed'));
    const { req, res } = createMockReqRes({ body: { ...validMovieBody } });

    await addMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error adding movie' })
    );
  });
});

// ─── UPDATE MOVIE ──────────────────────────────────────────────
describe('updateMovie', () => {
  it('should update a movie and return 204', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validMovieBody } });

    await updateMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 400 for invalid ObjectId', async () => {
    const { req, res } = createMockReqRes({
      params: { id: 'invalid-id' },
      body: { ...validMovieBody },
    });

    await updateMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid movie ID format' });
  });

  it('should return 400 when required fields are missing', async () => {
    const id = validObjectId();
    const { req, res } = createMockReqRes({ params: { id }, body: { title: 'Only Title' } });

    await updateMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Missing required fields' })
    );
  });

  it('should return 404 when movie to update is not found', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validMovieBody } });

    await updateMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
  });

  it('should return 500 on database error', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockRejectedValue(new Error('Update failed'));
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validMovieBody } });

    await updateMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error updating movie' })
    );
  });
});

// ─── DELETE MOVIE ──────────────────────────────────────────────
describe('deleteMovie', () => {
  it('should delete a movie and return 204', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
    const { req, res } = createMockReqRes({ params: { id } });

    await deleteMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 400 for invalid ObjectId', async () => {
    const { req, res } = createMockReqRes({ params: { id: 'bad-id' } });

    await deleteMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid movie ID format' });
  });

  it('should return 404 when movie to delete is not found', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
    const { req, res } = createMockReqRes({ params: { id } });

    await deleteMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
  });

  it('should return 500 on database error', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockRejectedValue(new Error('Delete failed'));
    const { req, res } = createMockReqRes({ params: { id } });

    await deleteMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error deleting movie' })
    );
  });
});
