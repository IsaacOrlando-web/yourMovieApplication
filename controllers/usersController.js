const mongodb = require('../db/database');
const ObjectId = require('mongodb').ObjectId;

const REQUIRED_FIELDS = [
    'name', 'email', 'profilePicture', 'createdAt', 'updatedAt'
];

/**
 * Validates that all required fields are present in the request body.
 * Returns an array of missing field names, or an empty array if valid.
 */
function validateUserBody(body) {
    return REQUIRED_FIELDS.filter((field) => body[field] === undefined || body[field] === null);
}

/**
 * Validates that the given string is a valid MongoDB ObjectId.
 */
function isValidObjectId(id) {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

const getAllUsers = async (req, res) => {
    try {
        const result = await mongodb.getDatabase().collection('users').find();
        const users = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};

const getSingleUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const collection = mongodb.getDatabase().collection('users');
        let result = null;

        if (ObjectId.isValid(userId)) {
            try {
                result = await collection.findOne({ _id: new ObjectId(userId) });
            } catch (e) {
                result = null;
            }
            if (!result) {
                // Fallback: _id may be stored as a plain string in some documents
                result = await collection.findOne({ _id: userId });
            }
        } else {
            result = await collection.findOne({ _id: userId });
        }

        res.setHeader('Content-Type', 'application/json');
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
};

const addUser = async (req, res) => {
    try {
        const missing = validateUserBody(req.body);
        if (missing.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missing
            });
        }
        const newUser = {
            name: req.body.name,
            email: req.body.email,
            profilePicture: req.body.profilePicture,
            createdAt: req.body.createdAt,
            updatedAt: req.body.updatedAt,
        };

        const result = await mongodb.getDatabase().collection('users').insertOne(newUser);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json({ message: 'User added successfully', insertedId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Error adding user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const missing = validateUserBody(req.body);
        if (missing.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missing
            });
        }

        const user = {
            name: req.body.name,
            email: req.body.email,
            profilePicture: req.body.profilePicture,
            createdAt: req.body.createdAt,
            updatedAt: req.body.updatedAt,
        };

        const response = await mongodb.getDatabase().collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: user }
        );

        if (response.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const response = await mongodb.getDatabase().collection('users').deleteOne(
            { _id: new ObjectId(userId) }
        );

        if (response.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = { getAllUsers, getSingleUser, addUser, updateUser, deleteUser };