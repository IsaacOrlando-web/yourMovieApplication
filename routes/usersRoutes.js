const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');

router.get('/', usersController.getAllUsers);
router.post('/', usersController.addUser);
router.get('/:id', usersController.getSingleUser);
router.delete('/:id', usersController.deleteUser);
router.put('/:id', usersController.updateUser);

module.exports = router;