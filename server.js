const express = require('express');
const mongodb = require('./db/database');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

const routes = require('./routes/index');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Z-Key'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/', routes);

// Connect to DB once at startup, then start the server
mongodb.initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to start server — database connection failed:', err);
  process.exit(1);
});