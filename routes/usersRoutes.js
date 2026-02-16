const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');

/*  #swagger.tags = ['Users']
    #swagger.summary = 'Get all users'
*/
router.get('/', usersController.getAllUsers);

/*  #swagger.tags = ['Users']
    #swagger.summary = 'Create user'
*/
router.post('/', usersController.addUser);

/*  #swagger.tags = ['Users']
    #swagger.summary = 'Get single user by ID'
*/
router.get('/:id', usersController.getSingleUser);

/*  #swagger.tags = ['Users']
    #swagger.summary = 'Delete user by ID'
*/
router.delete('/:id', usersController.deleteUser);

/*  #swagger.tags = ['Users']
    #swagger.summary = 'Update user by ID'
*/
router.put('/:id', usersController.updateUser);

module.exports = router;

router.get('/', usersController.getAllUsers);
router.post('/', usersController.addUser);
router.get('/:id', usersController.getSingleUser);
router.delete('/:id', usersController.deleteUser);
router.put('/:id', usersController.updateUser);

module.exports = router;

