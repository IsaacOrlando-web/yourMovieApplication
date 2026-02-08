const express = require('express');
const app = express();
const port = 3000;
const moviesRoute = require('./routes/moviesRoute');
const routes = require('./routes/index');
var morgan = require('morgan');

//Middlewares
app.use(express.urlencoded({ extended: true })); 
// Built-in middleware to parse JSON bodies
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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});