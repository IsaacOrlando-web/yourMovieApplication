const { ObjectId } = require('mongodb');

/**
 * Creates a mock MongoDB collection with standard CRUD methods.
 * Each method is a jest.fn() that can be configured per test.
 */
function createMockCollection() {
  const mockCursor = {
    toArray: jest.fn(),
  };

  return {
    find: jest.fn().mockReturnValue(mockCursor),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    _cursor: mockCursor,
  };
}

/**
 * Creates mock Express req/res objects for controller testing.
 */
function createMockReqRes(overrides = {}) {
  const req = {
    params: {},
    body: {},
    ...overrides,
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };

  return { req, res };
}

/**
 * Generates a valid ObjectId string for testing.
 */
function validObjectId() {
  return new ObjectId().toHexString();
}

module.exports = { createMockCollection, createMockReqRes, validObjectId };
