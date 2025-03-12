const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body; // Accept role if provided

    try {
        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Default role to 'Gamer' if not provided
        const userRole = role && role === "Admin" ? "Admin" : "Gamer";

        // Insert user into database with role
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, role',
            [username, email, hashedPassword, userRole]
        );

        // Get the newly created user ID
        const userId = newUser.rows[0].user_id;

        // If user is a gamer, create a gamer profile
        if (userRole === "Gamer") {
            await pool.query(
                `INSERT INTO gamer_profiles (user_id, psn_id, xbox_id, steam_username, steam64_id, avatar_url) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, 'N/A', 'N/A', 'N/A', null, 'images/default-avatar.png']
            );
        }

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Save session data
        req.session.user_id = user.rows[0].user_id;
        req.session.username = user.rows[0].username;
        req.session.email = user.rows[0].email;
        req.session.role = user.rows[0].role; // Store user role in session

        // Determine redirect page based on role
        const redirectPage = user.rows[0].role === "Admin" ? "admin-profile-page.html" : "gamer-profile-page.html";

        res.status(200).json({ message: 'Login successful', redirect: redirectPage, user: req.session });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout a user
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

// Check if user is logged in
router.get('/me', (req, res) => {
    if (req.session.user_id) {
        res.status(200).json({
            user_id: req.session.user_id,
            username: req.session.username,
            email: req.session.email,
            role: req.session.role // Return role
        });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

module.exports = router;
