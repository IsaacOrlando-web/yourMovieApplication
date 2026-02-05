const express = require('express');
const mongodb = require('../db/database');
const ObjectId = require('mongodb').ObjectId;


const getAllMovies = async (req, res) => {
    try{
        await mongodb.initDB();
        const result = await mongodb.getDatabase().collection('movies').find();
        console.log(result);
        result.toArray().then((movies) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(movies);
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving movies", error: error.message });
    }
}

const getSingleMovie = async (req, res) => {
    try {
        const movieId = req.params.id;
        console.log(movieId);
        await mongodb.initDB();
        const result = await mongodb.getDatabase().collection('movies').findOne({ _id: movieId });
        console.log(result);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving movie", error: error.message });
    }
}

const addMovie = async (req, res) => {
    try {
        console.log(req.body);
        const newMovie = {
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
        const result = await mongodb.getDatabase().collection('movies').insertOne(newMovie);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json({ message: "Movie added successfully", insertedId: result.insertedId });
    } catch(error) {
        res.status(500).json({ message: "Error adding movie", error: error.message });
    }
};

module.exports = { getAllMovies, getSingleMovie, addMovie };