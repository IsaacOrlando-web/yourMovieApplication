const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Movies API',
        description: 'A RESTful API for managing movie collections and most popular movies.'
    },
    host: 'localhost:3000',
    schemes: ['http', 'https']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);