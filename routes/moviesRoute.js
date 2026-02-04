const express = require('express');
const router = express.Router();

const moviesController = require('../controllers/moviesController');

router.get('/movies', moviesController.getAllMovies);
router.get('/movies/:id', moviesController.getSingleMovie);

module.exports = router;