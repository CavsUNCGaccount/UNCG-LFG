const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ===================== MIDDLEWARE =====================
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user_id) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// Get just the username from the session
router.get("/api/username", isAuthenticated, async (req, res) => {
    try {
        console.log("Session user_id:", req.session.user_id); // Debugging line
        const userId = req.session.user_id;
        const result = await pool.query("SELECT username FROM users WHERE user_id = $1", [userId]);

        if (result.rows.length > 0) {
            res.json({ username: result.rows[0].username });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ===================== GET GAMER PROFILE =====================
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
              gp.avatar_url AS profile_picture --
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

// ===================== UPDATE USERNAME =====================
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

// ===================== UPDATE EMAIL =====================
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

// ===================== UPDATE PSN =====================
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

// ===================== UPDATE XBOX =====================
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

// ===================== LINK STEAM =====================
router.put("/link-steam", isAuthenticated, async (req, res) => {
    const { steamId } = req.body;
    const userId = req.session.user_id;
    const STEAM_API_KEY = process.env.STEAM_API_KEY;

    try {
        const existing = await pool.query("SELECT user_id FROM gamer_profiles WHERE steam64_id = $1", [steamId]);

        if (existing.rows.length > 0 && existing.rows[0].user_id !== userId) {
            return res.status(400).json({ error: "This Steam account is already linked to another user." });
        }

        const steamAPIUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
        const response = await axios.get(steamAPIUrl);

        if (response.data.response.players.length === 0) {
            return res.status(404).json({ error: "Steam profile not found." });
        }

        const steamUsername = response.data.response.players[0].personaname;

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

// ===================== UPDATE STEAM =====================
// Note: This function is similar to link-steam but allows updating the Steam ID
// and username. It checks if the new Steam ID is already linked to another user.
// Note to self: It does not fully work as intended, but is included for completeness. Come back to this if you have time.
router.put("/update-steam", isAuthenticated, async (req, res) => {
    const { steam64_id } = req.body;

    try {
        const checkQuery = await pool.query("SELECT user_id FROM gamer_profiles WHERE steam64_id = $1", [steam64_id]);
        if (checkQuery.rows.length > 0) {
            return res.status(400).json({ error: "This Steam account is already linked to another user." });
        }

        const STEAM_API_KEY = process.env.STEAM_API_KEY;
        const steamAPIUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steam64_id}`;
        const response = await axios.get(steamAPIUrl);

        if (response.data.response.players.length === 0) {
            return res.status(404).json({ error: "Invalid Steam ID or Steam profile not found." });
        }

        const steamUsername = response.data.response.players[0].personaname;

        await pool.query(
            "UPDATE gamer_profiles SET steam64_id = $1, steam_username = $2 WHERE user_id = $3",
            [steam64_id, steamUsername, req.session.user_id]
        );

        res.status(200).json({ message: "Steam account linked successfully.", steam_username: steamUsername });
    } catch (error) {
        console.error("Error linking Steam account:", error);
        res.status(500).json({ error: "Failed to link Steam account." });
    }
});

// ===================== UPLOAD PROFILE PICTURE =====================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '..', 'public', 'uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + ext;
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif/;
        const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimeValid = allowed.test(file.mimetype);
        if (extValid && mimeValid) {
            cb(null, true);
        } else {
            cb(new Error("Only image files allowed (jpg, png, gif)"));
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

router.post('/upload-profile-picture', isAuthenticated, upload.single('profile_picture'), async (req, res) => {
    try {
        const userId = req.session.user_id;
        const filename = req.file.filename;
        const imagePath = `/uploads/${filename}`;

        // Delete old image from gamer_profiles
        const result = await pool.query("SELECT avatar_url FROM gamer_profiles WHERE user_id = $1", [userId]);
        const oldAvatar = result.rows[0]?.avatar_url;

        await pool.query("UPDATE gamer_profiles SET avatar_url = $1 WHERE user_id = $2", [imagePath, userId]);
        await pool.query("UPDATE users SET profile_picture = $1 WHERE user_id = $2", [imagePath, userId]); // also update users table

        if (oldAvatar && oldAvatar !== "/uploads/default-avatar.png") {
            const fullPath = path.join(__dirname, '..', 'public', oldAvatar);
            fs.access(fullPath, fs.constants.F_OK, (err) => {
                if (!err) fs.unlink(fullPath, (err) => {
                    if (err) console.error("Failed to delete old avatar:", err);
                });
            });
        }

        res.status(200).json({ message: 'Profile picture uploaded', profile_picture: imagePath });
    } catch (error) {
        console.error('Upload failed:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

module.exports = router;
