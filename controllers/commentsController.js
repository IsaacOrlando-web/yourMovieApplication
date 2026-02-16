const mongodb = require('../db/database');
const ObjectId = require('mongodb').ObjectId;

const REQUIRED_FIELDS = [
    'movieTitle', 'user', 'text', 'rating', 'createdAt', 'likes'
];

/**
 * Validates that all required fields are present in the request body.
 * Returns an array of missing field names, or an empty array if valid.
 */
function validateCommentBody(body) {
    return REQUIRED_FIELDS.filter((field) => body[field] === undefined || body[field] === null);
}

/**
 * Validates that the given string is a valid MongoDB ObjectId.
 */
function isValidObjectId(id) {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

const getAllComments = async (req, res) => {
    try {
        const result = await mongodb.getDatabase().collection('comments').find();
        const comments = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving comments', error: error.message });
    }
};

const getSingleComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const collection = mongodb.getDatabase().collection('comments');
        let result = null;

        if (ObjectId.isValid(commentId)) {
            try {
                result = await collection.findOne({ _id: new ObjectId(commentId) });
            } catch (e) {
                result = null;
            }
            if (!result) {
                // Fallback: _id may be stored as a plain string in some documents
                result = await collection.findOne({ _id: commentId });
            }
        } else {
            result = await collection.findOne({ _id: commentId });
        }

        res.setHeader('Content-Type', 'application/json');
        if (!result) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving comment', error: error.message });
    }
};

const addComment = async (req, res) => {
    try {
        const missing = validateCommentBody(req.body);
        if (missing.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missing
            });
        }
//add body here when you come back: 
        const newComment = {
            movieTitle: req.body.movieTitle,
            user: req.body.user,
            text: req.body.text,
            rating: req.body.rating,
            createdAt: req.body.createdAt,
            likes: req.body.likes,
        };

        const result = await mongodb.getDatabase().collection('comments').insertOne(newComment);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json({ message: 'Comment added successfully', insertedId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

const updateComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        if (!isValidObjectId(commentId)) {
            return res.status(400).json({ message: 'Invalid comment ID format' });
        }

        const missing = validateCommentBody(req.body);
        if (missing.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missing
            });
        }

        const comment = {
            movieTitle: req.body.movieTitle,
            user: req.body.user,
            text: req.body.text,
            rating: req.body.rating,
            createdAt: req.body.createdAt,
            likes: req.body.likes,
        };

        const response = await mongodb.getDatabase().collection('comments').updateOne(
            { _id: new ObjectId(commentId) },
            { $set: comment }
        );

        if (response.matchedCount === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error updating comment', error: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        if (!isValidObjectId(commentId)) {
            return res.status(400).json({ message: 'Invalid comment ID format' });
        }

        const response = await mongodb.getDatabase().collection('comments').deleteOne(
            { _id: new ObjectId(commentId) }
        );

        if (response.deletedCount === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};

module.exports = { getAllComments, getSingleComment, addComment, updateComment, deleteComment };