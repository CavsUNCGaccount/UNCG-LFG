const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const axios = require("axios"); // Required to fetch Steam profile data
require("dotenv").config(); // Load environment variables

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
              gp.steam64_id,
              gp.steam_username,
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

// Route to update PSN ID
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

// Route to link Steam account (Allows user to enter Steam ID)
router.put("/link-steam", isAuthenticated, async (req, res) => {
    const { steamId } = req.body;
    const userId = req.session.user_id;
    const STEAM_API_KEY = process.env.STEAM_API_KEY;

    try {
        // Check if the Steam ID is already linked to another user
        const existing = await pool.query(
            "SELECT user_id FROM gamer_profiles WHERE steam64_id = $1",
            [steamId]
        );

        if (existing.rows.length > 0 && existing.rows[0].user_id !== userId) {
            return res.status(400).json({ error: "This Steam account is already linked to another user." });
        }

        // Fetch Steam username using the Steam API
        const steamAPIUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
        const response = await axios.get(steamAPIUrl);

        if (response.data.response.players.length === 0) {
            return res.status(404).json({ error: "Steam profile not found." });
        }

        const steamUsername = response.data.response.players[0].personaname;

        // Update Steam ID and Steam username in the database
        await pool.query(
            "UPDATE gamer_profiles SET steam64_id = $1, steam_username = $2 WHERE user_id = $3",
            [steamId, steamUsername, userId]
        );

        res.status(200).json({ message: "Steam account linked successfully", steamUsername });
    } catch (error) {
        console.error("Error linking Steam account:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to update Steam ID and Steam username
router.put("/update-steam", isAuthenticated, async (req, res) => {
    const { steam64_id } = req.body;

    try {
        // Check if this Steam ID is already linked to another user
        const checkQuery = await pool.query("SELECT user_id FROM gamer_profiles WHERE steam64_id = $1", [steam64_id]);
        if (checkQuery.rows.length > 0) {
            return res.status(400).json({ error: "This Steam account is already linked to another user." });
        }

        // Fetch Steam username
        const STEAM_API_KEY = process.env.STEAM_API_KEY;
        const steamAPIUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steam64_id}`;
        const response = await axios.get(steamAPIUrl);

        if (response.data.response.players.length === 0) {
            return res.status(404).json({ error: "Invalid Steam ID or Steam profile not found." });
        }

        const steamUsername = response.data.response.players[0].personaname;

        // Update Steam ID and Steam username in database
        await pool.query("UPDATE gamer_profiles SET steam64_id = $1, steam_username = $2 WHERE user_id = $3", [steam64_id, steamUsername, req.session.user_id]);

        res.status(200).json({ message: "Steam account linked successfully.", steam_username: steamUsername });
    } catch (error) {
        console.error("Error linking Steam account:", error);
        res.status(500).json({ error: "Failed to link Steam account." });
    }
});

module.exports = router;
