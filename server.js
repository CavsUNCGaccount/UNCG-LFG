require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth');


// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form submissions
app.use(cors()); // Enable CORS for frontend requests
app.use(
    session({
        store: new pgSession({
            pool: pool, // PostgreSQL connection pool
            tableName: 'session', // Defaults to 'session'
        }),
        secret: process.env.SESSION_SECRET, // Store in .env
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to `true` in production with HTTPS
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);

const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use('/auth', authRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Welcome to UNCG LFG App! Let\'s play some games!');
});

// 404 Handler for Undefined Routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
});

//Kill the app with ctrl + c
//Run the app with node server.js
//Run the app with nodemon server.js

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

