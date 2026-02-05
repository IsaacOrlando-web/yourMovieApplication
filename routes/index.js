const express = require('express');
const mostPopularRoutes = require('./mostPopularRoutes');
const moviesRoute = require('./moviesRoute');
const app = express();
const router = express.Router();

router.use('/most-popular', mostPopularRoutes);
router.use('/movies', moviesRoute);
app.get('/', (req, res) => {
    res.send('Hello World!');
});

module.exports = router;