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

// Route to update username
router.put("/update-username", isAuthenticated, async (req, res) => {
    const { username } = req.body;
    try {
        await pool.query("UPDATE users SET username = $1 WHERE user_id = $2", [username, req.session.user_id]);
        res.status(200).json({ message: "Username updated successfully" });
    } catch (error) {
        console.error("Error updating username:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to update email
router.put("/update-email", isAuthenticated, async (req, res) => {
    const { email } = req.body;
    try {
        await pool.query("UPDATE users SET email = $1 WHERE user_id = $2", [email, req.session.user_id]);
        res.status(200).json({ message: "Email updated successfully" });
    } catch (error) {
        console.error("Error updating email:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to update psn ID
router.put("/update-psn", isAuthenticated, async (req, res) => {
    const { psn } = req.body;
    try {
        await pool.query("UPDATE gamer_profiles SET psn_id = $1 WHERE user_id = $2", [psn, req.session.user_id]);
        res.status(200).json({ message: "PSN ID updated successfully" });
    } catch (error) {
        console.error("Error updating PSN ID:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to update Xbox ID
router.put("/update-xbox", isAuthenticated, async (req, res) => {
    const { xbox } = req.body;
    try {
        await pool.query("UPDATE gamer_profiles SET xbox_id = $1 WHERE user_id = $2", [xbox, req.session.user_id]);
        res.status(200).json({ message: "Xbox ID updated successfully" });
    } catch (error) {
        console.error("Error updating Xbox ID:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
