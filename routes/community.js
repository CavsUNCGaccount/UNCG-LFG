const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Get a list of all the games in alphabetical order (Working)
// GET http://localhost:3001/community/games
router.get('/games', async (req, res) => {
    try {
        const gamesQuery = await pool.query("SELECT * FROM game_community ORDER BY game_name");
        res.json({ games: gamesQuery.rows });
    } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get a single game community by game name (Working)
// GET http://localhost:3001/community/games/:game_name (Replace :game_name with the actual game name)
router.get('/games/:game_name', async (req, res) => {
    try {
        const { game_name } = req.params;
        const gameQuery = await pool.query("SELECT * FROM game_community WHERE game_name = $1", [game_name]);

        if (gameQuery.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }

        res.json({ game: gameQuery.rows[0] });
    }
    catch (error) {
        console.error("Error fetching game:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Join a community (working)
// To test in Postman, you first need to log in on Postman and copy the session cookie to the headers.
// POST http://localhost:3001/community/games/:game_id/join (Requires user to be logged in. Replace :game_id with the actual game ID) 
console.log("Registering join community route: /games/:game_id/join"); // Debugging log
router.post('/games/:game_id/join', async (req, res) => {

    console.log("Join community request received:", req.params); // Debugging log
    console.log("Session Data at /join:", req.session); // Debugging log

    if (!req.session.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    const { game_id } = req.params;
    const user_id = req.session.user_id; 

    if (!game_id) {
        return res.status(400).json({ message: "Game ID is required." });
    }

    try {
        // Check if user is already a member
        const checkMembership = await pool.query(
            "SELECT * FROM community_membership WHERE gamer_id = $1 AND game_id = $2",
            [user_id, game_id]
        );

        if (checkMembership.rows.length > 0) {
            return res.status(400).json({ message: "You are already a member of this community." });
        }

        // Insert user into community_membership table
        await pool.query(
            "INSERT INTO community_membership (gamer_id, game_id) VALUES ($1, $2)",
            [user_id, game_id]
        );

        res.status(201).json({ message: "Successfully joined the community!" });
    } catch (err) {
        console.error("Error joining community:", err);
        res.status(500).json({ message: "Server error. Could not join community." });
    }
});

// Leave a community (working)
// To test in Postman, you first need to log in on Postman and copy the session cookie to the headers.
// DELETE http://localhost:3001/community/games/:game_id/leave (Requires user to be logged in. Replace :game_id with the actual game ID)
console.log("Registering leave community route: /games/:game_id/leave"); // Debugging log
router.delete('/games/:game_id/leave', async (req, res) => {

    console.log("Leave community request received:", req.params); // Debugging log
    console.log("Session Data at /leave:", req.session); // Debugging log

    if (!req.session.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    const { game_id } = req.params;
    const user_id = req.session.user_id;

    if (!game_id) {
        return res.status(400).json({ message: "Game ID is required." });
    }

    try {
        // Check if user is a member
        const checkMembership = await pool.query(
            "SELECT * FROM community_membership WHERE gamer_id = $1 AND game_id = $2",
            [user_id, game_id]
        );

        if (checkMembership.rows.length === 0) {
            return res.status(400).json({ message: "You are not a member of this community." });
        }

        // Remove user from community_membership table
        await pool.query(
            "DELETE FROM community_membership WHERE gamer_id = $1 AND game_id = $2",
            [user_id, game_id]
        );

        res.status(200).json({ message: "Successfully left the community." });
    } catch (err) {
        console.error("Error leaving community:", err);
        res.status(500).json({ message: "Server error. Could not leave community." });
    }
});

// Get game_id by game title (Working)
// GET http://localhost:3001/community/game-id?title=Game%20Title (Replace Game%20Title with the actual game title)
router.get('/game-id', async (req, res) => {
    const { title } = req.query;
    if (!title) {
        return res.status(400).json({ message: "Game title is required" });
    }

    try {
        const gameQuery = await pool.query(
            "SELECT game_id FROM game_community WHERE game_name = $1",
            [title]
        );

        if (gameQuery.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }

        res.json({ game_id: gameQuery.rows[0].game_id });
    } catch (error) {
        console.error("Error fetching game ID:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get communities for the logged-in user (Working)
// GET http://localhost:3001/community/my-communities (Requires user to be logged in)
router.get('/my-communities', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    const user_id = req.session.user_id;

    try {
        const communitiesQuery = await pool.query(
            "SELECT gc.game_name, gc.cover_image_url FROM community_membership cm JOIN game_community gc ON cm.game_id = gc.game_id WHERE cm.gamer_id = $1",
            [user_id]
        );

        res.json({ communities: communitiesQuery.rows });
    } catch (error) {
        console.error("Error fetching communities:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Check membership status (Working)
// GET http://localhost:3001/community/membership-status?game_id=1 (Requires user to be logged in)
router.get('/membership-status', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    const { game_id } = req.query;
    const user_id = req.session.user_id;

    try {
        const checkMembership = await pool.query(
            "SELECT * FROM community_membership WHERE gamer_id = $1 AND game_id = $2",
            [user_id, game_id]
        );

        if (checkMembership.rows.length > 0) {
            res.json({ isMember: true });
        } else {
            res.json({ isMember: false });
        }
    } catch (error) {
        console.error("Error checking membership status:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
