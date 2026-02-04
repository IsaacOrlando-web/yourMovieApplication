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
        const movieId = new ObjectId(req.params.id);
        await mongodb.initDB();
        const result = await mongodb.getDatabase().collection('movies').findOne({ _id: movieId });
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving movie", error: error.message });
    }
}

module.exports = { getAllMovies, getSingleMovie };