const mongodb = require('../db/database');
const ObjectId = require('mongodb').ObjectId;

const REQUIRED_FIELDS = [
    'movieId', 'title', 'description', 'genre', 'releaseYear', 'director',
    'duration', 'rating', 'posterUrl', 'trailerUrl', 'cast',
    'language', 'country', 'addedDate', 'views', 'isPopular', 'copyrightStatus'
];

/**
 * Validates that all required fields are present in the request body.
 * Returns an array of missing field names, or an empty array if valid.
 */
function validatePopularBody(body) {
    return REQUIRED_FIELDS.filter((field) => body[field] === undefined || body[field] === null);
}

/**
 * Validates that the given string is a valid MongoDB ObjectId.
 */
function isValidObjectId(id) {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

const getAllPopular = async (req, res) => {
    try {
        const result = await mongodb.getDatabase().collection('mostpopular').find();
        const movies = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving movies', error: error.message });
    }
};

const getSinglePopular = async (req, res) => {
    try {
        const movieId = req.params.id;
        const collection = mongodb.getDatabase().collection('mostpopular');
        let result = null;

        if (ObjectId.isValid(movieId)) {
            try {
                result = await collection.findOne({ _id: new ObjectId(movieId) });
            } catch (e) {
                result = null;
            }
            if (!result) {
                // Fallback: _id may be stored as a plain string in some documents
                result = await collection.findOne({ _id: movieId });
            }
        } else {
            result = await collection.findOne({ _id: movieId });
        }

        res.setHeader('Content-Type', 'application/json');
        if (!result) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving movie', error: error.message });
    }
};

const addPopular = async (req, res) => {
    try {
        const missing = validatePopularBody(req.body);
        if (missing.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missing
            });
        }

        const newPopular = {
            movieId: req.body.movieId,
            title: req.body.title,
            description: req.body.description,
            genre: req.body.genre,
            releaseYear: req.body.releaseYear,
            director: req.body.director,
            duration: req.body.duration,
            rating: req.body.rating,
            posterUrl: req.body.posterUrl,
            trailerUrl: req.body.trailerUrl,
            cast: req.body.cast,
            language: req.body.language,
            country: req.body.country,
            addedDate: req.body.addedDate,
            views: req.body.views,
            isPopular: req.body.isPopular,
            copyrightStatus: req.body.copyrightStatus
        };

        const result = await mongodb.getDatabase().collection('mostpopular').insertOne(newPopular);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json({ message: 'Movie added to most popular', id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Error adding movie', error: error.message });
    }
};

const updatePopular = async (req, res) => {
    try {
        const movieId = req.params.id;
        if (!isValidObjectId(movieId)) {
            return res.status(400).json({ message: 'Invalid movie ID format' });
        }

        const missing = validatePopularBody(req.body);
        if (missing.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missing
            });
        }

        const movie = {
            movieId: req.body.movieId,
            title: req.body.title,
            description: req.body.description,
            genre: req.body.genre,
            releaseYear: req.body.releaseYear,
            director: req.body.director,
            duration: req.body.duration,
            rating: req.body.rating,
            posterUrl: req.body.posterUrl,
            trailerUrl: req.body.trailerUrl,
            cast: req.body.cast,
            language: req.body.language,
            country: req.body.country,
            addedDate: req.body.addedDate,
            views: req.body.views,
            isPopular: req.body.isPopular,
            copyrightStatus: req.body.copyrightStatus
        };

        const response = await mongodb.getDatabase().collection('mostpopular').updateOne(
            { _id: new ObjectId(movieId) },
            { $set: movie }
        );

        if (response.matchedCount === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error updating movie', error: error.message });
    }
};

const deletePopular = async (req, res) => {
    try {
        const movieId = req.params.id;
        if (!isValidObjectId(movieId)) {
            return res.status(400).json({ message: 'Invalid movie ID format' });
        }

        const response = await mongodb.getDatabase().collection('mostpopular').deleteOne(
            { _id: new ObjectId(movieId) }
        );

        if (response.deletedCount === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting movie', error: error.message });
    }
};

module.exports = { getAllPopular, getSinglePopular, deletePopular, addPopular, updatePopular };