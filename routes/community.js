const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Join a community
router.post('/join', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }

    const { game_id } = req.body;
    const user_id = req.session.user.user_id;

    try {
        // Check if user is already a member
        const checkMembership = await pool.query(
            'SELECT * FROM community_membership WHERE gamer_id = $1 AND game_id = $2',
            [user_id, game_id]
        );

        if (checkMembership.rows.length > 0) {
            return res.status(400).json({ message: 'You are already a member of this community.' });
        }

        // Insert user into community_membership table
        await pool.query(
            'INSERT INTO community_membership (gamer_id, game_id) VALUES ($1, $2)',
            [user_id, game_id]
        );

        res.status(201).json({ message: 'Successfully joined the community!' });
    } catch (err) {
        console.error('Error joining community:', err.message);
        res.status(500).json({ message: 'Server error. Could not join community.' });
    }
});

module.exports = router;
