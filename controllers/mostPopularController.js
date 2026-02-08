const express = require('express');
const mongodb = require('../db/database');
const { title } = require('process');
const { updateMovie } = require('./moviesController');
const ObjectId = require('mongodb').ObjectId;

const getAllPopular = async (req, res) => {
    try {
        await mongodb.initDB();
        const result = await mongodb.getDatabase().collection('mostpopular').find();
        console.log(result);
        result.toArray().then((movies) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(movies);
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving movies", error: error.message });
    }
};

const getSinglePopular = async (req, res) => {
    try {
        const movieId = req.params.id;
        await mongodb.initDB();
        const collection = mongodb.getDatabase().collection('mostpopular');
        let result = null;

        if (ObjectId.isValid(movieId)) {
            try {
                result = await collection.findOne({ _id: new ObjectId(movieId) });
            } catch (e) {
                result = null;
            }
            if (!result) {
                // fallback: maybe _id is stored as a string in some documents
                result = await collection.findOne({ _id: movieId });
            }
        } else {
            result = await collection.findOne({ _id: movieId });
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving movie", error: error.message });
    }
};

const addPopular = async (req, res) => {
    try {
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
            await mongodb.initDB();
            const result = await mongodb.getDatabase().collection('mostpopular').insertOne(newPopular);
            res.setHeader('Content-Type', 'application/json');
            res.status(201).json({ message: "Movie added to most popular", id: result.insertedId });
        }catch(error){
        res.status(500).json({ message: "Error adding movie", error: error.message });
    }
};

const updatePopular = async (req, res) => {
    try {
        await mongodb.initDB();

        const movieId = req.params.id;

        const movie = {
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
        }
        const response = await mongodb.getDatabase().collection('mostpopular').updateOne({ _id: movieId }, { $set: movie });

        if (response.modifiedCount === 0) {
            return res.status(404).json('Movie not found');
        } 
        res.status(204).send();

    } catch (err) {
        res.status(500).json(err.message || 'Some error occurred while updating the movie.');
    }
}


const deletePopular = async (req, res) => {
    try {
        const movieId = new ObjectId(req.params.id);
        const response = await mongodb.getDatabase().db().collection('mostpopular').deleteOne({ _id: movieId });

        if (response.deletedCount > 0) {
        res.status(204).send();
        } 
    } catch (err) {
        res.status(500).json(response.error || 'Some error occurred while deleting the movie.');
    }
}

module.exports = { getAllPopular, getSinglePopular, deletePopular, addPopular, updatePopular };