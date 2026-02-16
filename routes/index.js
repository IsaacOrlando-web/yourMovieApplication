const express = require('express');
const router = express.Router();

const mostPopularRoutes = require('./mostPopularRoutes');
const moviesRoute = require('./moviesRoute');

const commentsRoutes = require('./commentsRoutes');
const usersRoutes = require('./usersRoutes');


const commentsRoutes = require('./commentsRoutes');
const usersRoutes = require('./usersRoutes');

const authRouter = require('./auth');

router.use('/', authRouter); // Auth routes

router.use('/most-popular', mostPopularRoutes);
router.use('/movies', moviesRoute);
router.use('/comments', commentsRoutes);
router.use('/users', usersRoutes);
router.use('/', require('./swagger'));

module.exports = router;