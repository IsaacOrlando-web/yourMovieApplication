const express = require('express');
const router = express.Router();

const commentsController = require('../controllers/commentsController');

/*  #swagger.tags = ['Comments']
    #swagger.summary = 'Get all comments'
*/
router.get('/', commentsController.getAllComments);

/*  #swagger.tags = ['Comments']
    #swagger.summary = 'Create a comment'
*/
router.post('/', commentsController.addComment);

/*  #swagger.tags = ['Comments']
    #swagger.summary = 'Get single comment by ID'
*/
router.get('/:id', commentsController.getSingleComment);

/*  #swagger.tags = ['Comments']
    #swagger.summary = 'Delete comment by ID'
*/
router.delete('/:id', commentsController.deleteComment);

/*  #swagger.tags = ['Comments']
    #swagger.summary = 'Update comment by ID'
*/
router.put('/:id', commentsController.updateComment);

module.exports = router;
