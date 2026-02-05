const express = require('express');
const router = express.Router();

const popularController = require('../controllers/mostPopularController');

router.get('/', popularController.getAllPopular);
router.get('/:id', popularController.getSinglePopular);

module.exports = router;