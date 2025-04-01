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
        console.log("User role:", userRole); // Debugging line

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
                [userId, 'N/A', 'N/A', null, null, 'images/default-avatar.png']
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



        // Save session with profile picture
        req.session.user_id = user.rows[0].user_id;
        req.session.username = user.rows[0].username;
        req.session.email = user.rows[0].email;
        req.session.role = user.rows[0].role;
        req.session.profile_picture = user.rows[0].profile_picture;

        res.status(200).json({
            message: 'Login successful',
            user: {
                user_id: user.rows[0].user_id,
                username: user.rows[0].username,
                email: user.rows[0].email,
                role: user.rows[0].role,
                profile_picture: user.rows[0].profile_picture
            }
        });
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
router.get('/me', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const user = await pool.query(
            "SELECT user_id, username, email, role, profile_picture FROM users WHERE user_id = $1",
            [req.session.user_id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.rows[0]); // Return profile_picture field too
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
