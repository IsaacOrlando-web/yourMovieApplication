const express = require('express');
const router = express.Router();

const mostPopularRoutes = require('./mostPopularRoutes');
const moviesRoute = require('./moviesRoute');

router.use('/most-popular', mostPopularRoutes);
router.use('/movies', moviesRoute);
router.use('/', require('./swagger'));

module.exports = router;