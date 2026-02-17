const { ObjectId } = require('mongodb');
const { createMockCollection, createMockReqRes, validObjectId } = require('../helpers/mockDb');

const mockCollection = createMockCollection();
jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => ({
    collection: jest.fn(() => mockCollection),
  })),
}));

const {
  getAllComments,
  getSingleComment,
  addComment,
  updateComment,
  deleteComment,
} = require('../../controllers/commentsController');

const validCommentBody = {
  movieTitle: 'Test Movie',
  user: 'testuser',
  text: 'Great movie!',
  rating: 9,
  createdAt: '2024-06-15',
  likes: 42,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET ALL COMMENTS ──────────────────────────────────────────
describe('getAllComments', () => {
  it('should return all comments with status 200', async () => {
    const comments = [{ _id: '1', text: 'Nice!' }, { _id: '2', text: 'Cool!' }];
    mockCollection._cursor.toArray.mockResolvedValue(comments);
    const { req, res } = createMockReqRes();

    await getAllComments(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(comments);
  });

  it('should return empty array when no comments exist', async () => {
    mockCollection._cursor.toArray.mockResolvedValue([]);
    const { req, res } = createMockReqRes();

    await getAllComments(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 on database error', async () => {
    mockCollection._cursor.toArray.mockRejectedValue(new Error('DB error'));
    const { req, res } = createMockReqRes();

    await getAllComments(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error retrieving comments' })
    );
  });
});

// ─── GET SINGLE COMMENT ────────────────────────────────────────
describe('getSingleComment', () => {
  it('should return a comment by valid ObjectId', async () => {
    const id = validObjectId();
    const comment = { _id: new ObjectId(id), text: 'Found it' };
    mockCollection.findOne.mockResolvedValue(comment);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(comment);
  });

  it('should return 404 when comment is not found', async () => {
    const id = validObjectId();
    mockCollection.findOne.mockResolvedValue(null);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' });
  });

  it('should fallback to string ID lookup', async () => {
    const id = validObjectId();
    const comment = { _id: id, text: 'String ID comment' };
    mockCollection.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(comment);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockCollection.findOne).toHaveBeenCalledTimes(2);
  });

  it('should handle non-ObjectId string IDs', async () => {
    const id = 'custom-string-id';
    const comment = { _id: id, text: 'Custom ID comment' };
    mockCollection.findOne.mockResolvedValue(comment);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(comment);
  });

  it('should return 500 on database error', async () => {
    mockCollection.findOne.mockRejectedValue(new Error('DB error'));
    const { req, res } = createMockReqRes({ params: { id: 'abc' } });

    await getSingleComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── ADD COMMENT ───────────────────────────────────────────────
describe('addComment', () => {
  it('should create a comment and return 201', async () => {
    const insertedId = new ObjectId();
    mockCollection.insertOne.mockResolvedValue({ insertedId });
    const { req, res } = createMockReqRes({ body: { ...validCommentBody } });

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Comment added successfully',
      insertedId,
    });
  });

  it('should return 400 when required fields are missing', async () => {
    const { req, res } = createMockReqRes({ body: { movieTitle: 'Only title' } });

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Missing required fields',
        missingFields: expect.arrayContaining(['user', 'text', 'rating']),
      })
    );
  });

  it('should return 400 when body is empty', async () => {
    const { req, res } = createMockReqRes({ body: {} });

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        missingFields: expect.arrayContaining([
          'movieTitle', 'user', 'text', 'rating', 'createdAt', 'likes',
        ]),
      })
    );
  });

  it('should return 400 when a required field is null', async () => {
    const body = { ...validCommentBody, text: null };
    const { req, res } = createMockReqRes({ body });

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ missingFields: ['text'] })
    );
  });

  it('should return 500 on database error', async () => {
    mockCollection.insertOne.mockRejectedValue(new Error('Insert failed'));
    const { req, res } = createMockReqRes({ body: { ...validCommentBody } });

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── UPDATE COMMENT ────────────────────────────────────────────
describe('updateComment', () => {
  it('should update a comment and return 204', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validCommentBody } });

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 400 for invalid ObjectId', async () => {
    const { req, res } = createMockReqRes({
      params: { id: 'not-valid' },
      body: { ...validCommentBody },
    });

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid comment ID format' });
  });

  it('should return 400 when required fields are missing', async () => {
    const id = validObjectId();
    const { req, res } = createMockReqRes({ params: { id }, body: {} });

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Missing required fields' })
    );
  });

  it('should return 404 when comment to update is not found', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validCommentBody } });

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' });
  });

  it('should return 500 on database error', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockRejectedValue(new Error('Update failed'));
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validCommentBody } });

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── DELETE COMMENT ────────────────────────────────────────────
describe('deleteComment', () => {
  it('should delete a comment and return 204', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
    const { req, res } = createMockReqRes({ params: { id } });

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 400 for invalid ObjectId', async () => {
    const { req, res } = createMockReqRes({ params: { id: 'bad' } });

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid comment ID format' });
  });

  it('should return 404 when comment to delete is not found', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
    const { req, res } = createMockReqRes({ params: { id } });

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' });
  });

  it('should return 500 on database error', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockRejectedValue(new Error('Delete failed'));
    const { req, res } = createMockReqRes({ params: { id } });

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
