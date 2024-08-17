const express = require('express');
const cors = require('cors');
const app = express();
const logger = require('./logging')
const { expressjwt: jwt } = require('express-jwt');
const cookieParser = require('cookie-parser');

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost', 'http://127.0.0.1:3000', 'http://127.0.0.1'],  // Allow multiple origins, or use a function to dynamically allow origins
    optionsSuccessStatus: 200,  // Some legacy browsers (IE11, various SmartTVs) choke on 204
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],  // Specify HTTP methods allowed
<<<<<<< HEAD
    allowedHeaders: ['Content-Type', 'Authorization', 'Skip-Interceptor'],  // Specify headers that can be sent with the request
=======
    allowedHeaders: ['Content-Type', 'Authorization'],  // Specify headers that can be sent with the request
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
    exposedHeaders: ['Content-Range', 'X-Content-Range'],  // Headers that are safe to expose to the API of a CORS API specification
    credentials: true,  // Enable credentials to allow cookies to be sent from the client
    preflightContinue: false,  // Pass the CORS preflight response to the next handler
    maxAge: 600  // Set the maximum time (in seconds) the results of a preflight request can be cached
};

app.use((req, res, next) => {
<<<<<<< HEAD
	console.log(req.path);
    next();
});

// Cookie parser middleware
app.use(cookieParser());

// CORS middleware
app.use(cors(corsOptions));

app.use((req, res, next) => {
    if (!req.path.startsWith('/auth') || req.path === '/auth/checkAuth') {
        jwt({
            secret: process.env.JWT_SECRET,
            algorithms: ['HS256'],
            getToken: req => req.cookies.INVENTORY
        })(req, res, next);
    } else {
        next();
    }
});
=======
    console.log(req.path);
    next();
});

// CORS middleware
app.use(cors(corsOptions));

// Cookie parser middleware
app.use(cookieParser());
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98

// Body parser middleware
app.use(express.json());

// Static file middleware
app.use(express.static('public'));

<<<<<<< HEAD
const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const userRoutes = require('./routes/userRoutes');
const peripheralRoutes = require('./routes/peripheralRoutes');
const searchRoutes = require('./routes/searchRoutes');
const formRoutes = require('./routes/formRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/auth', authRoutes);
=======
app.use(jwt({
	secret: process.env.JWT_SECRET,
	algorithms: ['HS256'],
	getToken: req => req.cookies.token, // Function to obtain the JWT from request cookies
	// requestProperty: 'auth' // default is auth i think
}).unless({
	path: [
		'/api/auth/login',
		'/api/auth/register',
		'/api/auth/logout'
	]
}));

// Import and use routes
const assetRoutes = require('./routes/assetRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes')
const formRoutes = require('./routes/formRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

app.use('/api/auth', authRoutes);
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
app.use('/api/assets', assetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/dashboard', dashboardRoutes)
<<<<<<< HEAD
app.use('/api/peripherals', peripheralRoutes)
=======
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98

// Setup global error handling middleware to catch authentication errors

app.use(function (err, req, res, next) {
<<<<<<< HEAD
    console.log(req.cookies.token);
    console.log('Middleware Error: ' + err.stack);
    logger.error('Middleware Error: ' + err.stack);
    if (err.name === 'UnauthorizedError') {
        // This error is thrown by the JWT middleware when a token is invalid
        res.status(401).json({ error: 'Invalid Token' });
    } else {
        // For other errors, you can return a generic error message or use the error's message
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
=======
	console.log(req.cookies.token);
	console.log('Middleware Error: ' + err.stack);
	logger.error('Middleware Error: ' + err.stack);
	if (err.name === 'UnauthorizedError') {
		// This error is thrown by the JWT middleware when a token is invalid
		res.status(401).json({ error: 'Invalid Token' });
	} else {
		// Pass any other types of errors to the next error handler (if there is one)
		next(err);
	}
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
});

module.exports = app;
