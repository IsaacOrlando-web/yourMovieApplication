const express = require('express');
const router = express.Router();

const popularController = require('../controllers/mostPopularController');

router.get('/', popularController.getAllPopular);
router.post('/', popularController.addPopular);
router.get('/:id', popularController.getSinglePopular);
router.delete('/:id', popularController.deletePopular);
router.put('/:id', popularController.updatePopular);

module.exports = router;