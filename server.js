const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables first
const mongodb = require('./db/database');
const morgan = require('morgan');
var session = require('express-session');
var passport = require('passport');
const { mongoStoreFactory } = require('mongo-express-session');
const { getDatabase, initDB, client } = require('./db/database');
const MongoStore = mongoStoreFactory(session);

const app = express();
const port = process.env.PORT || 3000;

// Connect to DB before starting the session
(async () => {
    await initDB();
})();



const routes = require('./routes/index');

const store = new MongoStore({
    client: client,           // ✅ Reutiliza tu cliente existente
    dbName: 'yourMovies',     // Misma DB que usas
    collection: 'sessions',   // Colección para las sesiones
    ttlMs: 1000 * 60 * 60 * 24 * 14, // 14 días (expiración)
    cleanupStrategy: 'native' // Usa TTL index de MongoDB
})

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
    secret: process.env.SESSION_SECRET,   // ⚠️ CAMBIA ESTO en producción
    resave: true,
    saveUninitialized: false,
    store: store,            // ✅ Tu store de MongoDB
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14, // 14 días
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction  // Set to true in production with HTTPS
    }
}));
app.use(passport.initialize());
app.use(passport.authenticate('session'));

app.use((req, res, next) => {
  // Only apply CORS to API routes, not OAuth routes
  if (!req.path.includes('/oauth') && !req.path.includes('/login/federated')) {
    const origin = req.headers.origin;
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Z-Key'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
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