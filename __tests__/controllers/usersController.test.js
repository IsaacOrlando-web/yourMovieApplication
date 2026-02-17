const { ObjectId } = require('mongodb');
const { createMockCollection, createMockReqRes, validObjectId } = require('../helpers/mockDb');

const mockCollection = createMockCollection();
jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => ({
    collection: jest.fn(() => mockCollection),
  })),
}));

const {
  getAllUsers,
  getSingleUser,
  addUser,
  updateUser,
  deleteUser,
} = require('../../controllers/usersController');

const validUserBody = {
  name: 'John Doe',
  email: 'john@example.com',
  profilePicture: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01',
  updatedAt: '2024-06-15',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET ALL USERS ─────────────────────────────────────────────
describe('getAllUsers', () => {
  it('should return all users with status 200', async () => {
    const users = [{ _id: '1', name: 'Alice' }, { _id: '2', name: 'Bob' }];
    mockCollection._cursor.toArray.mockResolvedValue(users);
    const { req, res } = createMockReqRes();

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it('should return empty array when no users exist', async () => {
    mockCollection._cursor.toArray.mockResolvedValue([]);
    const { req, res } = createMockReqRes();

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('should return 500 on database error', async () => {
    mockCollection._cursor.toArray.mockRejectedValue(new Error('DB error'));
    const { req, res } = createMockReqRes();

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error retrieving users' })
    );
  });
});

// ─── GET SINGLE USER ───────────────────────────────────────────
describe('getSingleUser', () => {
  it('should return a user by valid ObjectId', async () => {
    const id = validObjectId();
    const user = { _id: new ObjectId(id), name: 'Alice' };
    mockCollection.findOne.mockResolvedValue(user);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('should return 404 when user is not found', async () => {
    const id = validObjectId();
    mockCollection.findOne.mockResolvedValue(null);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should fallback to string ID lookup', async () => {
    const id = validObjectId();
    const user = { _id: id, name: 'String ID User' };
    mockCollection.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(user);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockCollection.findOne).toHaveBeenCalledTimes(2);
  });

  it('should handle non-ObjectId string IDs', async () => {
    const id = 'custom-id';
    const user = { _id: id, name: 'Custom User' };
    mockCollection.findOne.mockResolvedValue(user);
    const { req, res } = createMockReqRes({ params: { id } });

    await getSingleUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('should return 500 on database error', async () => {
    mockCollection.findOne.mockRejectedValue(new Error('DB error'));
    const { req, res } = createMockReqRes({ params: { id: 'abc' } });

    await getSingleUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── ADD USER ──────────────────────────────────────────────────
describe('addUser', () => {
  it('should create a user and return 201', async () => {
    const insertedId = new ObjectId();
    mockCollection.insertOne.mockResolvedValue({ insertedId });
    const { req, res } = createMockReqRes({ body: { ...validUserBody } });

    await addUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User added successfully',
      insertedId,
    });
  });

  it('should return 400 when required fields are missing', async () => {
    const { req, res } = createMockReqRes({ body: { name: 'Only Name' } });

    await addUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Missing required fields',
        missingFields: expect.arrayContaining(['email', 'profilePicture']),
      })
    );
  });

  it('should return 400 when body is empty', async () => {
    const { req, res } = createMockReqRes({ body: {} });

    await addUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        missingFields: expect.arrayContaining([
          'name', 'email', 'profilePicture', 'createdAt', 'updatedAt',
        ]),
      })
    );
  });

  it('should return 400 when a required field is null', async () => {
    const body = { ...validUserBody, email: null };
    const { req, res } = createMockReqRes({ body });

    await addUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ missingFields: ['email'] })
    );
  });

  it('should return 500 on database error', async () => {
    mockCollection.insertOne.mockRejectedValue(new Error('Insert failed'));
    const { req, res } = createMockReqRes({ body: { ...validUserBody } });

    await addUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── UPDATE USER ───────────────────────────────────────────────
describe('updateUser', () => {
  it('should update a user and return 204', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validUserBody } });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 400 for invalid ObjectId', async () => {
    const { req, res } = createMockReqRes({
      params: { id: 'invalid' },
      body: { ...validUserBody },
    });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
  });

  it('should return 400 when required fields are missing', async () => {
    const id = validObjectId();
    const { req, res } = createMockReqRes({ params: { id }, body: {} });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Missing required fields' })
    );
  });

  it('should return 404 when user to update is not found', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validUserBody } });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 on database error', async () => {
    const id = validObjectId();
    mockCollection.updateOne.mockRejectedValue(new Error('Update failed'));
    const { req, res } = createMockReqRes({ params: { id }, body: { ...validUserBody } });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── DELETE USER ───────────────────────────────────────────────
describe('deleteUser', () => {
  it('should delete a user and return 204', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
    const { req, res } = createMockReqRes({ params: { id } });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 400 for invalid ObjectId', async () => {
    const { req, res } = createMockReqRes({ params: { id: 'nope' } });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
  });

  it('should return 404 when user to delete is not found', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
    const { req, res } = createMockReqRes({ params: { id } });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 on database error', async () => {
    const id = validObjectId();
    mockCollection.deleteOne.mockRejectedValue(new Error('Delete failed'));
    const { req, res } = createMockReqRes({ params: { id } });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
