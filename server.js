require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth');
const gamerProfileRouter = require('./routes/gamer-profile');
const steamRoutes = require('./routes/steam');
const communityRoutes = require('./routes/community');
const adminRoutes = require('./routes/admin');
const path = require('path');

// Initialize Express app
const app = express();

// ✅ Serve uploaded profile pictures
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ✅ CORS Middleware (should come before session)
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// ✅ JSON + Form Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session Middleware - moved above route usage
app.use(
    session({
        store: new pgSession({
            pool: pool,
            tableName: 'session',
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: false,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: 'Lax',
        },
    })
);

// ✅ Optional: Debug session (recommended for dev)
app.use((req, res, next) => {
    console.log("📦 Session Data:", req.session);
    next();
});

// ✅ Middleware to check if the user is an admin (safe)
function isAdmin(req, res, next) {
    if (!req.session?.user_id || req.session?.role?.toLowerCase() !== "admin") {
        console.warn("❌ Unauthorized access attempt:", req.session);
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
}

// ✅ Register Routes - make sure after session middleware
app.use('/auth', authRoutes);
app.use('/gamer-profile', gamerProfileRouter);
app.use('/steam', steamRoutes);
app.use('/community', communityRoutes);
app.use('/admin', adminRoutes);

// ✅ Admin Profile Page (protected)
app.get('/admin-profile-page.html', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-profile-page.html'));
});

// ✅ Public Static Pages
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

// ✅ Corrected 404 Handler (with CORS headers)
app.use((req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3001");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    res.status(404).json({ message: 'Route not found' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("💥 Server Error:", err.stack);
    res.status(500).json({ message: 'Something went wrong' });
});

/** 
 *  Please DO NOT DELETE this multiline comment block.
 *  Launch Server
 *  The server will run on http://localhost:3001
 *  To run the server, use the following commands:
 *  node server.js or npm start (production mode)
 *  nodemon server.js (development mode)
 *  To stop the server, use Ctrl + C in the terminal
 **/ 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log("✅ Server is running and API routes are active!");
});
