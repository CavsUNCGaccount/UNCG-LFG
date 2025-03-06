const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../config/db");
require("dotenv").config();

/**
 * Fetch a Steam profile by Steam ID.
 * To fetch a Steam profile, we need to make a request to the Steam API.
 * The Steam API requires an API key, which you can get by creating a Steam account and registering a new application.
 * To test this route, you can use the following URL in your browser or on Postman:
 * GET http://localhost:3001/steam/profile/STEAM_ID_NUMBER
 * Replace STEAM_ID_NUMBER with your Steam ID number.
 */
router.get("/profile/:steamId", async (req, res) => {
    try {
        const { steamId } = req.params;
        const userId = req.session.user_id; // Get logged-in user ID
        const STEAM_API_KEY = process.env.STEAM_API_KEY;

        console.log(`Incoming request for Steam ID: ${steamId} by user ID: ${userId}`);

        if (!STEAM_API_KEY) {
            console.error("Steam API key is missing.");
            return res.status(500).json({ error: "Steam API key is missing." });
        }

        if (!userId) {
            console.error("Unauthorized access attempt.");
            return res.status(401).json({ error: "Unauthorized. Please log in first." });
        }

        // Check if the Steam ID is already linked to another account
        console.log("Checking if Steam ID is already linked to another user...");
        const existingUser = await pool.query(
            "SELECT user_id FROM gamer_profiles WHERE steam64_id = $1",
            [steamId]
        );

        if (existingUser.rows.length > 0 && existingUser.rows[0].user_id !== userId) {
            console.error(`Steam ID ${steamId} is already linked to another user.`);
            return res.status(400).json({ error: "This Steam account is already linked to another user." });
        }

        console.log(`Fetching Steam profile for Steam ID: ${steamId}`);
        const steamAPIUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
        const response = await axios.get(steamAPIUrl);

        if (!response.data.response.players || response.data.response.players.length === 0) {
            console.error(`Steam profile not found for Steam ID: ${steamId}`);
            return res.status(404).json({ error: "Steam profile not found." });
        }

        const playerData = response.data.response.players[0];

        console.log("Steam profile data received:", playerData);

        const profile = {
            steam64_id: playerData.steamid, // Steam64 ID number
            steam_username: playerData.personaname, // Steam username
            avatar: playerData.avatarfull,
            profile_url: playerData.profileurl,
        };

        console.log(`Updating gamer_profiles for user ID: ${userId} with Steam ID: ${profile.steam64_id}`);

        // Update only if steam64_id is NULL
        const updateQuery = `
            UPDATE gamer_profiles 
            SET steam_username = $1, steam64_id = $2
            WHERE user_id = $3 AND steam64_id IS NULL
            RETURNING *;
        `;

        const updateResult = await pool.query(updateQuery, [
            profile.steam_username,
            profile.steam64_id,
            userId,
        ]);

        if (updateResult.rowCount === 0) {
            console.warn(`Steam account already linked or cannot be updated for user ID: ${userId}`);
            return res.status(400).json({ error: "Steam account is already linked or cannot be updated." });
        }

        console.log(`Successfully linked Steam account ${profile.steam64_id} to user ID ${userId}`);

        res.json(profile);

    } catch (error) {
        console.error("Error fetching Steam profile:", error);
        res.status(500).json({ error: "Failed to fetch Steam profile" });
    }
});

// Route to fetch Steam games
// http://localhost:3001/steam/games/YOUR_STEAM_ID
router.get("/games/:steamid", async (req, res) => {
    const steamID = req.params.steamid;
    console.log(`Fetching Steam games for Steam ID: ${steamID}`);

    try {
        const apiKey = process.env.STEAM_API_KEY;  
        const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamID}&format=json&include_appinfo=true`;

        // Use axios instead of fetch (fetch is not built-in for Node.js)
        const response = await axios.get(url);
        if (!response.data.response || !response.data.response.games) {
            return res.status(404).json({ error: "No games found for this Steam ID." });
        }

        res.json(response.data.response);
    } catch (error) {
        console.error("Error fetching Steam games:", error);
        res.status(500).json({ error: "Failed to fetch games" });
    }
});

/**
 * Route to fetch Steam achievements for a specific game
 * Example usage: http://localhost:3001/steam/achievements/YOUR_STEAM_ID/GAME_APP_ID
 * Note: Some older games like Call of Duty 2 (2005) do not have achievement support.
 *  Also, the achievement icons do not work, so I tried to use default icons I ended up just commenting out the icon part
 * */
router.get("/achievements/:steamid/:appid", async (req, res) => {
    const { steamid, appid } = req.params;

    console.log(`Fetching achievements for SteamID: ${steamid}, AppID: ${appid}`);

    try {
        const apiKey = process.env.STEAM_API_KEY;

        // Fetch player achievements
        const playerAchievementsUrl = `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appid}&key=${apiKey}&steamid=${steamid}&l=en`;
        const playerResponse = await axios.get(playerAchievementsUrl);

        if (!playerResponse.data.playerstats || !playerResponse.data.playerstats.achievements) {
            return res.status(404).json({ error: "No achievements found." });
        }

        // Fetch achievement icons from game schema
        const schemaUrl = `http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${appid}`;
        const schemaResponse = await axios.get(schemaUrl);
        const achievementSchema = schemaResponse.data.game?.availableGameStats?.achievements || [];

        // Create a map of achievement names to icons
        const achievementIconMap = {};
        achievementSchema.forEach(ach => {
            achievementIconMap[ach.name] = {
                unlocked: ach.icon || "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/default-unlocked.jpg",
                locked: ach.icongray || "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/default-locked.jpg"
            };
        });

        // Process achievements and match them with icons
        const achievements = playerResponse.data.playerstats.achievements.map(ach => ({
            name: ach.name,
            description: ach.description || "No description available.",
            unlocked: ach.achieved === 1,
            unlock_time: ach.unlocktime ? new Date(ach.unlocktime * 1000).toISOString().split("T")[0] : "N/A",
            icon: ach.achieved === 1
                ? achievementIconMap[ach.name]?.unlocked || "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/default-unlocked.jpg"
                : achievementIconMap[ach.name]?.locked || "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/default-locked.jpg"
        }));

        res.json({ achievements });
    } catch (error) {
        console.error("Error fetching Steam achievements:", error);
        res.status(500).json({ error: "Failed to fetch achievements" });
    }
});

module.exports = router;
