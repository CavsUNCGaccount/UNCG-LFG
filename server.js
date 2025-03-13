require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth');
const gamerProfileRouter = require("./routes/gamer-profile");
const steamRoutes = require('./routes/steam');
const communityRoutes = require('./routes/community');
const adminRoutes = require('./routes/admin'); // ✅ Import admin routes

// Initialize Express app
const app = express();

// ✅ Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (!req.session.user_id || req.session.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
}

app.use('/uploads', express.static('public/uploads'));


// Cors Middleware (Before session middleware)
app.use(cors({
    origin: 'http://localhost:3001', // Adjust this if using a different port or domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow cookies to be sent
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form submissions

// Session Middleware
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
            httpOnly: false, // Change to `true` in production
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: 'Lax' // Set to 'Strict' or 'Lax in production
        },
    })
);

// ✅ Restrict Access to Admin Pages
app.get('/admin-profile-page.html', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-profile-page.html'));
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/gamer-profile-page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gamer-profile-page.html'));
});

app.get('/view-game-achievements.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view-game-achievements.html'));
});
app.get('/community.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'community.html'));
});

// ✅ Use the routes
app.use('/auth', authRoutes);
app.use("/gamer-profile", gamerProfileRouter);
app.use('/steam', steamRoutes);
app.use('/community', communityRoutes);
app.use('/admin', adminRoutes); // ✅ Register admin routes

// 404 Handler for Undefined Routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
    res.header("Access-Control-Allow-Origin", "http://localhost:3001"); // Allow frontend access
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();   
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
});

/**
 * Run the app with nodemon server.js (developer mode)
 * Run the app with node server.js (production mode)
 * Open http://localhost:3001 in your browser
 * Kill the app with ctrl + c
 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Server is running and API routes are active!");
});
