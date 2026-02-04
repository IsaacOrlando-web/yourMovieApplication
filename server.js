const express = require('express');
const app = express();
const port = 3000;
const moviesRoute = require('./routes/moviesRoute');

app.use('/', moviesRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});