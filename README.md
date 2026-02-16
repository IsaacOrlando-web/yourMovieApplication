# Movie API

A RESTful API for managing a movie catalog and tracking most popular movies. Built with Node.js, Express, and MongoDB.

## Features

- **Movie Management**: Create, read, update, and delete movies.
- **Popular Movies**: Track and manage a collection of most popular movies.
- **API Documentation**: Integrated Swagger UI for interactive API testing.
- **Input Validation**: Robust validation for data integrity.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Native Driver)
- **Documentation**: Swagger UI Express & Swagger Autogen

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB connection string (Atlas or local)

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:IsaacOrlando-web/yourMovieApplication.git
   cd yourMovieApplication
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add your MongoDB credentials:
   ```env
   DATABASE_USER=youruser
   DATABASE_PASSWORD=yourpassword
   PORT=3000
   ```
   > Note: The connection string in `db/database.js` expects these variables.

4. Start the server:
   ```bash
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Documentation

Once the server is running, visit **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** to explore and test the API endpoints using Swagger UI.

### Key Endpoints

#### Movies (`/movies`)
- `GET /` - List all movies
- `GET /:id` - Get a single movie by ID
- `POST /` - Add a new movie
- `PUT /:id` - Update a movie
- `DELETE /:id` - Delete a movie

#### Most Popular (`/most-popular`)
- `GET /` - List most popular movies
- `GET /:id` - Get a specific popular movie
- `POST /` - Add to most popular
- `PUT /:id` - Update a popular movie entry
- `DELETE /:id` - Remove from most popular
