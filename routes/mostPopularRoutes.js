const express = require('express');
const router = express.Router();

const popularController = require('../controllers/mostPopularController');

router.get('/', popularController.getAllPopular);
router.get('/:id', popularController.getSinglePopular);
router.delete('/:id', popularController.deletePopular);

module.exports = router;