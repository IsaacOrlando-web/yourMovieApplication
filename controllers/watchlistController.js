const watchlist = require('../db/watchlist.json');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');


const watchlistFilePath = path.join(__dirname, '../db/watchlist.json');

// GET 
const getWatchlist = (req, res) => {
  res.json(watchlist);
};

// POST 
const addToWatchlist = (req, res) => {
  const { movieId } = req.body;

  if (!movieId) {
    return res.status(400).json({ message: 'movieId is required' });
  }

  const item = {
    _id: uuidv4(),
    movieId,
    user: req.user?.email || 'anonymous',
    addedAt: new Date().toISOString()
  };

  watchlist.push(item);


  try {
    fs.writeFileSync(watchlistFilePath, JSON.stringify(watchlist, null, 2));
  } catch (err) {
    console.error('Error writing watchlist file:', err);
    return res.status(500).json({ message: 'Failed to save watchlist', error: err.message });
  }

  res.status(201).json(item);
};


module.exports = {
  getWatchlist,
  addToWatchlist
};
