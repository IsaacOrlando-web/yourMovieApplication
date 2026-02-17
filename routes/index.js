const express = require('express');
const router = express.Router();

const mostPopularRoutes = require('./mostPopularRoutes');
const moviesRoute = require('./moviesRoute');

const commentsRoutes = require('./commentsRoutes');
const usersRoutes = require('./usersRoutes');
const { ensureAuth } = require('../middleware/authentication');

const authRouter = require('./auth');

router.use('/', authRouter); // Auth routes

router.use('/most-popular', mostPopularRoutes);
router.use('/movies', moviesRoute);
router.use('/comments', ensureAuth ,commentsRoutes);
router.use('/users', ensureAuth ,usersRoutes);
router.use('/', require('./swagger'));

module.exports = router;