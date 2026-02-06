const express = require('express');
const router = express.Router();

const moviesController = require('../controllers/moviesController');

router.get('/', moviesController.getAllMovies);
router.get('/:id', moviesController.getSingleMovie);
router.post('/', moviesController.addMovie);
router.delete('/:id', moviesController.deleteMovie);

module.exports = router;