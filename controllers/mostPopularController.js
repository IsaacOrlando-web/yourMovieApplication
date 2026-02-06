const express = require('express');
const mongodb = require('../db/database');
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

module.exports = { getAllPopular, getSinglePopular, deletePopular };