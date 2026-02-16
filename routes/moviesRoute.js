const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');

/*  #swagger.tags = ['Movies']
    #swagger.summary = 'Get all movies'
*/
router.get('/', moviesController.getAllMovies);

/*  #swagger.tags = ['Movies']
    #swagger.summary = 'Get single movie by ID'
*/
router.get('/:id', moviesController.getSingleMovie);

/*  #swagger.tags = ['Movies']
    #swagger.summary = 'Add a new movie'
*/
router.post('/', moviesController.addMovie);

/*  #swagger.tags = ['Movies']
    #swagger.summary = 'Update movie by ID'
*/
router.put('/:id', moviesController.updateMovie);

/*  #swagger.tags = ['Movies']
    #swagger.summary = 'Delete movie by ID'
*/
router.delete('/:id', moviesController.deleteMovie);

module.exports = router;
