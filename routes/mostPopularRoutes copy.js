const express = require('express');
const router = express.Router();

const popularController = require('../controllers/mostPopularController');

/*  #swagger.tags = ['MostPopular']
    #swagger.summary = 'Get all most popular movies'
*/
router.get('/', popularController.getAllPopular);

/*  #swagger.tags = ['MostPopular']
    #swagger.summary = 'Add a movie to most popular'
*/
router.post('/', popularController.addPopular);

/*  #swagger.tags = ['MostPopular']
    #swagger.summary = 'Get single most popular movie by ID'
*/
router.get('/:id', popularController.getSinglePopular);

/*  #swagger.tags = ['MostPopular']
    #swagger.summary = 'Delete most popular movie by ID'
*/
router.delete('/:id', popularController.deletePopular);

/*  #swagger.tags = ['MostPopular']
    #swagger.summary = 'Update most popular movie by ID'
*/
router.put('/:id', popularController.updatePopular);

module.exports = router;
