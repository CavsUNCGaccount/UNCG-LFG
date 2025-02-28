const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user_id) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// Route to get gamer profile for logged-in user
router.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user_id;
        const result = await pool.query(
            `SELECT 
          u.username,
          u.email,
          gp.steam_id,
          gp.psn_id,
          gp.xbox_id,
          gp.avatar_url
        FROM users u
        LEFT JOIN gamer_profiles gp ON u.user_id = gp.user_id
        WHERE u.user_id = $1`,
            [userId]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.json({ message: "No profile info available" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
