const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables first
const mongodb = require('./db/database');
const morgan = require('morgan');
var session = require('express-session');
var passport = require('passport');
const { mongoStoreFactory } = require('mongo-express-session');
const { client } = require('./db/database');
const MongoStore = mongoStoreFactory(session);

const app = express();
const port = process.env.PORT || 3000;

// ===== CONFIGURACIÓN CRÍTICA PARA RENDER =====
// 1. Trust proxy - DEBE IR INMEDIATAMENTE DESPUÉS DE CREAR APP
app.set('trust proxy', 1);

// 2. Middleware para forzar HTTPS en producción
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        // Si viene de Render con HTTPS, aseguramos que req.protocol sea 'https'
        if (req.headers['x-forwarded-proto'] === 'https') {
            req.protocol = 'https';
        }
    }
    next();
});
// ============================================

// Connect to DB before starting the session
(async () => {
    await mongodb.initDB();
})();

const routes = require('./routes/index');

const store = new MongoStore({
    client: client,
    dbName: 'yourMovies',
    collection: 'sessions',
    ttlMs: 1000 * 60 * 60 * 24 * 14, // 14 días
    cleanupStrategy: 'native',
    // AÑADE ESTAS OPCIONES:
    autoRemove: 'native',
    touchAfter: 24 * 3600, // Solo actualiza una vez al día si no hay cambios
    crypto: {
        secret: process.env.SESSION_SECRET // Encripta las sesiones
    }
});

// AÑADE ESTE EVENTO PARA VERIFICAR
store.on('create', (sessionId) => {
    console.log('✅ Sesión creada en MongoDB:', sessionId);
});

store.on('touch', (sessionId) => {
    console.log('👆 Sesión actualizada:', sessionId);
});

// Middlewares básicos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

const isProduction = process.env.NODE_ENV === 'production';

// Configuración de sesión CORREGIDA
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14,
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        domain: isProduction ? '.yourmovieapplication.onrender.com' : undefined
    },
    name: 'sessionId',
    rolling: true, // Renueva la cookie en cada request
    unset: 'destroy' // Elimina la sesión si no se usa
}));
// Passport - ORDEN CORRECTO
app.use(passport.initialize());
app.use(passport.session()); // 👈 CAMBIADO: NO usar authenticate('session')

// Middleware de debug (temporal)
app.use((req, res, next) => {
    console.log('🔍 DEBUG - Request:', {
        path: req.path,
        protocol: req.protocol,
        secure: req.secure,
        'x-forwarded-proto': req.headers['x-forwarded-proto'],
        sessionID: req.sessionID,
        user: req.user ? 'logged in' : 'anonymous'
    });
    next();
});

// CORS - Solo para APIs, no para OAuth
app.use((req, res, next) => {
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

// Iniciar servidor
mongodb.initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
        console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
        console.log(`Cookies secure: ${isProduction}`);
    });
}).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});