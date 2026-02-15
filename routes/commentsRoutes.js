const express = require('express');
const router = express.Router();

const commentsController = require('../controllers/commentsController');

router.get('/', commentsController.getAllComments);
router.post('/', commentsController.addComment);
router.get('/:id', commentsController.getSingleComment);
router.delete('/:id', commentsController.deleteComment);
router.put('/:id', commentsController.updateComment);

module.exports = router;