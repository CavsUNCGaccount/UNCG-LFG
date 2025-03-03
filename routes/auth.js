const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email',
            [username, email, hashedPassword]
        );

        // Get the newly created user ID
        const userId = newUser.rows[0].user_id;

        // Create a default gamer profile for the new user in the gamer_profiles table
        await pool.query(
            `INSERT INTO gamer_profiles (user_id, psn_id, xbox_id, steam_username, steam64_id, avatar_url) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, 'N/A', 'N/A', 'N/A', null, 'images/default-avatar.png']
        );

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

        
        // Save session
        req.session.user_id = user.rows[0].user_id;
        req.session.username = user.rows[0].username;
        req.session.email = user.rows[0].email;

        // Save session
        //req.session.user = {
        //    user_id: user.rows[0].user_id,
        //    username: user.rows[0].username,
        //    email: user.rows[0].email,
        //};

        res.status(200).json({ message: 'Login successful', user: req.session.user });
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
            email: req.session.email,});
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

module.exports = router;
