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
// possible bug here returning error message (polishing) 
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
            `
            SELECT 
                gc.game_name, 
                gc.cover_image_url 
            FROM 
                community_membership cm 
            JOIN 
                game_community gc 
            ON 
                cm.game_id = gc.game_id 
            WHERE 
                cm.gamer_id = $1
            ORDER BY 
                gc.game_name
            `,
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

/* ========================================== User Posts =============================================== */
// Create a new post
router.post('/create-post', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: "Please log in first to make a post." });
    }

    const { game_name, post_content } = req.body;
    const user_id = req.session.user_id;

    if (!game_name || !post_content) {
        return res.status(400).json({ message: "Game name and post content are required." });
    }

    try {
        // Get community_id from game_name
        const gameQuery = await pool.query("SELECT game_id FROM game_community WHERE game_name = $1", [game_name]);
        if (gameQuery.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }
        const community_id = gameQuery.rows[0].game_id;

        const newPost = await pool.query(
            "INSERT INTO user_posts (user_id, community_id, post_content) VALUES ($1, $2, $3) RETURNING *",
            [user_id, community_id, post_content]
        );

        res.status(201).json(newPost.rows[0]);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Server error. Could not create post." });
    }
});

// Get posts for a community
router.get('/posts', async (req, res) => {
    const { game_name } = req.query;
    const user_id = req.session.user_id;

    if (!game_name) {
        return res.status(400).json({ message: "Game name is required." });
    }

    try {
        // Get community_id from game_name
        const gameQuery = await pool.query("SELECT game_id FROM game_community WHERE game_name = $1", [game_name]);
        if (gameQuery.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }
        const community_id = gameQuery.rows[0].game_id;

        const posts = await pool.query(
            `SELECT 
                up.post_id, 
                u.username, 
                up.post_content, 
                up.created_at, 
                gc.game_name, 
                gc.cover_image_url,
                CASE WHEN up.user_id = $2 THEN true ELSE false END AS is_owner
            FROM user_posts up 
            JOIN users u ON up.user_id = u.user_id 
            JOIN game_community gc ON up.community_id = gc.game_id 
            WHERE up.community_id = $1 
            ORDER BY up.created_at DESC`,
            [community_id, user_id]
        );

        res.json(posts.rows);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ message: "Server error. Could not fetch posts." });
    }
});

// Get the top 5 most recent posts for a game
router.get('/recent-posts', async (req, res) => {
    const { game_name } = req.query;

    if (!game_name) {
        return res.status(400).json({ message: "Game name is required." });
    }

    try {
        // Get community_id from game_name
        const gameQuery = await pool.query("SELECT game_id FROM game_community WHERE game_name = $1", [game_name]);
        if (gameQuery.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }
        const community_id = gameQuery.rows[0].game_id;

        // Fetch the top 5 most recent posts
        const posts = await pool.query(
            `SELECT 
                up.post_id, 
                u.username, 
                up.post_content, 
                up.created_at 
            FROM user_posts up 
            JOIN users u ON up.user_id = u.user_id 
            WHERE up.community_id = $1 
            ORDER BY up.created_at DESC 
            LIMIT 5`,
            [community_id]
        );

        res.json(posts.rows);
    } catch (err) {
        console.error("Error fetching recent posts:", err);
        res.status(500).json({ message: "Server error. Could not fetch recent posts." });
    }
});

// Update a post
router.put('/edit-post', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    const { post_id, post_content } = req.body;
    const user_id = req.session.user_id;

    if (!post_id || !post_content) {
        return res.status(400).json({ message: "Post ID and new content are required." });
    }

    try {
        // Ensure the post belongs to the logged-in user
        const postQuery = await pool.query(
            "SELECT * FROM user_posts WHERE post_id = $1 AND user_id = $2",
            [post_id, user_id]
        );

        if (postQuery.rows.length === 0) {
            return res.status(403).json({ message: "You can only edit your own posts." });
        }

        // Update the post content
        const updatedPost = await pool.query(
            "UPDATE user_posts SET post_content = $1 WHERE post_id = $2 RETURNING *",
            [post_content, post_id]
        );

        res.status(200).json(updatedPost.rows[0]);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ message: "Server error. Could not update post." });
    }
});

// Create a reply to a post
router.post('/create-reply', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: "Please log in first to reply to a post." });
    }

    const { post_id, reply_content, parent_reply_id } = req.body;
    const user_id = req.session.user_id;

    if (!post_id || !reply_content) {
        return res.status(400).json({ message: "Post ID and reply content are required." });
    }

    try {
        const newReply = await pool.query(
            "INSERT INTO user_posts_replies (user_id, post_id, reply_content, parent_reply_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [user_id, post_id, reply_content, parent_reply_id || null]
        );

        res.status(201).json(newReply.rows[0]);
    } catch (err) {
        console.error("Error creating reply:", err);
        res.status(500).json({ message: "Server error. Could not create reply." });
    }
});

// Get replies for a post
router.get('/replies', async (req, res) => {
    const { post_id } = req.query;

    if (!post_id) {
        return res.status(400).json({ message: "Post ID is required." });
    }

    try {
        const replies = await pool.query(
            `SELECT 
                r.reply_id, 
                r.reply_content, 
                r.created_at, 
                r.parent_reply_id, 
                u.username 
            FROM user_posts_replies r 
            JOIN users u ON r.user_id = u.user_id 
            WHERE r.post_id = $1 
            ORDER BY r.created_at ASC`,
            [post_id]
        );

        res.json(replies.rows);
    } catch (err) {
        console.error("Error fetching replies:", err);
        res.status(500).json({ message: "Server error. Could not fetch replies." });
    }
});

/* ========================================= Look for Groups =========================================== */

// Get group sessions for a game
router.get('/group-sessions', async (req, res) => {
    const { game_name } = req.query;

    if (!game_name) {
        return res.status(400).json({ message: "Game name is required." });
    }

    try {
        // Get community_id from game_name
        const gameQuery = await pool.query("SELECT game_id FROM game_community WHERE game_name = $1", [game_name]);
        if (gameQuery.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }
        const community_id = gameQuery.rows[0].game_id;

        // Fetch group sessions for the game
        const sessions = await pool.query(
            `SELECT 
                g.group_id, 
                g.session_title,
                g.session_description,
                g.platform,
                g.session_type, 
                g.session_status, 
                g.max_players, 
                g.current_players, 
                g.start_time, 
                g.duration, 
                u.username AS host_username 
            FROM groups g 
            JOIN users u ON g.host_user_id = u.user_id 
            WHERE g.community_id = $1 
            ORDER BY g.start_time`,
            [community_id]
        );

        res.json(sessions.rows);
    } catch (err) {
        console.error("Error fetching group sessions:", err);
        res.status(500).json({ message: "Server error. Could not fetch group sessions." });
    }
});

// Create a new group session
router.post('/create-group-session', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: "Please log in first to create a group." });
    }

    const { game_name, session_type, max_players, start_time, duration, session_title, session_description, platform } = req.body;
    const user_id = req.session.user_id;

    if (!game_name || !session_type || !max_players || !start_time || !duration || !session_title || !platform) {
        return res.status(400).json({ message: "All required fields must be provided." });
    }

    try {
        // Get community_id from game_name
        const gameQuery = await pool.query("SELECT game_id FROM game_community WHERE game_name = $1", [game_name]);
        if (gameQuery.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }
        const community_id = gameQuery.rows[0].game_id;

        // Insert the new group session
        const newGroup = await pool.query(
            `INSERT INTO groups 
                (community_id, host_user_id, session_type, session_status, max_players, start_time, duration, session_title, session_description, platform) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING group_id`,
            [community_id, user_id, session_type, 'Open', max_players, start_time, duration, session_title, session_description, platform]
        );

        const group_id = newGroup.rows[0].group_id;

        // Insert session host as a member
        await pool.query(
            `INSERT INTO group_members (group_id, user_id, is_session_host) 
             VALUES ($1, $2, TRUE)`,
            [group_id, user_id]
        );

        res.status(201).json({ message: "Group session created successfully", group_id });
    } catch (err) {
        console.error("Error creating group session:", err);
        res.status(500).json({ message: "Server error. Could not create group session." });
    }
});

// Get the top 5 most recent group sessions for a game
router.get('/recent-groups', async (req, res) => {
    const { game_name } = req.query;

    if (!game_name) {
        return res.status(400).json({ message: "Game name is required." });
    }

    try {
        // Get community_id from game_name
        const gameQuery = await pool.query("SELECT game_id FROM game_community WHERE game_name = $1", [game_name]);
        if (gameQuery.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }
        const community_id = gameQuery.rows[0].game_id;

        // Fetch the top 5 most recent group sessions
        const sessions = await pool.query(
            `SELECT 
                g.group_id, 
                g.session_title, 
                g.session_description, 
                g.platform, 
                g.session_type, 
                g.session_status, 
                g.max_players, 
                g.current_players, 
                g.start_time, 
                g.duration,
                g.created_at, 
                u.username AS host_username 
            FROM groups g 
            JOIN users u ON g.host_user_id = u.user_id 
            WHERE g.community_id = $1 
            ORDER BY g.start_time DESC 
            LIMIT 5`,
            [community_id]
        );

        res.json(sessions.rows);
    } catch (err) {
        console.error("Error fetching recent group sessions:", err);
        res.status(500).json({ message: "Server error. Could not fetch recent group sessions." });
    }
});

// Get details for a single group session by group_id
// GET http://localhost:3001/community/group/:group_id (Replace :group_id with the actual group ID)
router.get('/group/:group_id', async (req, res) => {
    const { group_id } = req.params;

    try {
        const groupQuery = await pool.query(
            `SELECT 
                g.*,
                u.username AS host_username,
                gc.game_name
            FROM groups g
            JOIN users u ON g.host_user_id = u.user_id
            JOIN game_community gc ON g.community_id = gc.game_id
            WHERE g.group_id = $1`,
            [group_id]
        );

        if (groupQuery.rows.length === 0) {
            return res.status(404).json({ message: "Group not found." });
        }

        res.status(200).json(groupQuery.rows[0]);
    } catch (err) {
        console.error("Error fetching group details:", err);
        res.status(500).json({ message: "Server error. Could not retrieve group details." });
    }
});

// Get members of a group session with additional profile info
router.get('/group/:group_id/members', async (req, res) => {
    const groupId = req.params.group_id;

    try {
        const result = await pool.query(`
            SELECT 
                gm.user_id, 
                u.username, 
                gm.is_session_host,
                gp.steam_username,
                gp.psn_id,
                gp.xbox_id
            FROM group_members gm
            JOIN users u ON gm.user_id = u.user_id
            LEFT JOIN gamer_profiles gp ON u.user_id = gp.user_id
            WHERE gm.group_id = $1
        `, [groupId]);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching group members:", err);
        res.status(500).json({ message: "Failed to retrieve group members." });
    }
});

// Join a group (working)
// POST http://localhost:3001/community/group/:groupId/join (Replace :groupId with the actual group ID)
// Requires user to be logged in
router.post("/group/:groupId/join", async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.session.user_id;

    if (!userId) {
        return res.status(401).json({ message: "Please log in to join groups." });
    }

    try {
        // Check if already a member
        const check = await pool.query(
            "SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2",
            [groupId, userId]
        );
        if (check.rows.length > 0) {
            return res.status(400).json({ message: "Already joined this group." });
        }

        // Count current players in the group
        const countResult = await pool.query(
            "SELECT COUNT(*) FROM group_members WHERE group_id = $1",
            [groupId]
        );

        const currentPlayers = parseInt(countResult.rows[0].count);

        // Get max_players for the group
        const groupResult = await pool.query(
            "SELECT max_players FROM groups WHERE group_id = $1",
            [groupId]
        );

        const maxPlayers = groupResult.rows[0].max_players;

        if (currentPlayers >= maxPlayers) {
            return res.status(400).json({ message: "This group is already full." });
        }

        // Add user to group
        await pool.query(
            "INSERT INTO group_members (group_id, user_id, is_session_host) VALUES ($1, $2, false)",
            [groupId, userId]
        );

        await pool.query(
            "UPDATE groups SET current_players = current_players + 1 WHERE group_id = $1",
            [groupId]
        );

        // If current_players reaches max_players, update session_status to 'Closed'
        if (currentPlayers + 1 >= maxPlayers) {
            await pool.query(
                "UPDATE groups SET session_status = 'Closed' WHERE group_id = $1",
                [groupId]
            );
        }  

        res.status(200).json({ message: "Joined the group successfully!" });
    } catch (err) {
        console.error("Error joining group:", err);
        res.status(500).json({ message: "Could not join group." });
    }
});

// Leave a group (working)
// POST http://localhost:3001/community/group/:groupId/leave (Replace :groupId with the actual group ID)
// Requires user to be logged in
router.post("/group/:groupId/leave", async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.session.user_id;

    if (!userId) {
        return res.status(401).json({ message: "Please log in to leave groups." });
    }

    try {
        const result = await pool.query(
            "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 AND is_session_host = false RETURNING *",
            [groupId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({ message: "Not part of the group or you're the session host." });
        }

        await pool.query(
            "UPDATE groups SET current_players = current_players - 1 WHERE group_id = $1",
            [groupId]
        );

        // If current_players goes below max_players, update session_status to 'Open'
        const countResult = await pool.query(
            "SELECT COUNT(*) FROM group_members WHERE group_id = $1",
            [groupId]
        );
        const currentPlayers = parseInt(countResult.rows[0].count);

        const groupResult = await pool.query(
            "SELECT max_players FROM groups WHERE group_id = $1",
            [groupId]
        );
        const maxPlayers = groupResult.rows[0].max_players;

        if (currentPlayers < maxPlayers) {
            await pool.query(
                "UPDATE groups SET session_status = 'Open' WHERE group_id = $1",
                [groupId]
            );
        }

        res.status(200).json({ message: "Left the group successfully." });
    } catch (err) {
        console.error("Error leaving group:", err);
        res.status(500).json({ message: "Could not leave group." });
    }
});

// Kick a gamer from a group (host only)
// POST http://localhost:3001/community/group/:group_id/kick/:user_id (Replace :group_id and :user_id with actual IDs)
// Requires user to be logged in and be the host of the group
router.post('/group/:group_id/kick/:user_id', async (req, res) => {
    const { group_id, user_id } = req.params;
    const host_id = req.session.user_id;

    if (!host_id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Verify host owns this group
        const groupCheck = await pool.query(
            "SELECT * FROM groups WHERE group_id = $1 AND host_user_id = $2",
            [group_id, host_id]
        );
        if (groupCheck.rows.length === 0) {
            return res.status(403).json({ message: "You are not the host of this group." });
        }

        // Prevent host from kicking themselves
        if (parseInt(user_id) === host_id) {
            return res.status(400).json({ message: "You can't kick yourself." });
        }

        // Remove the user from the group_members table
        await pool.query(
            "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2",
            [group_id, user_id]
        );

        // Ensure that current_players does not go below 0 and to open up a slot when a user is kicked
        await pool.query(
            "UPDATE groups SET current_players = current_players - 1 WHERE group_id = $1 AND current_players > 0",
            [group_id]
        );

        // If current_players goes below max_players, update session_status to 'Open'
        const countResult = await pool.query(
            "SELECT COUNT(*) FROM group_members WHERE group_id = $1",
            [group_id]
        );
        const currentPlayers = parseInt(countResult.rows[0].count);

        const groupResult = await pool.query(
            "SELECT max_players FROM groups WHERE group_id = $1",
            [group_id]
        );
        const maxPlayers = groupResult.rows[0].max_players;

        if (currentPlayers < maxPlayers) {
            await pool.query(
                "UPDATE groups SET session_status = 'Open' WHERE group_id = $1",
                [group_id]
            );
        }

        res.status(200).json({ message: "User kicked from the group." });
    } catch (err) {
        console.error("Kick error:", err);
        res.status(500).json({ message: "Failed to kick user." });
    }
});

// Get messages for a group
// GET http://localhost:3001/community/group/:groupId/messages (Replace :groupId with the actual group ID)
router.get("/group/:groupId/messages", async (req, res) => {
    const groupId = req.params.groupId;

    try {
        const messages = await pool.query(`
            SELECT m.message_id, m.message_content, m.created_at, u.username 
            FROM group_messages m
            JOIN users u ON m.user_id = u.user_id
            WHERE m.group_id = $1
            ORDER BY m.created_at DESC
        `, [groupId]);

        res.json(messages.rows);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Post a new message to a group
// POST http://localhost:3001/community/group/:groupId/messages (Replace :groupId with the actual group ID)
// Requires user to be logged in
router.post("/group/:groupId/messages", async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.session.user_id;
    const { message_content } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated." });
    }

    if (!message_content || message_content.trim() === "") {
        return res.status(400).json({ message: "Message cannot be empty." });
    }

    try {
        await pool.query(
            "INSERT INTO group_messages (group_id, user_id, message_content, created_at) VALUES ($1, $2, $3, current_timestamp)",
            [groupId, userId, message_content]
        );
        res.status(201).json({ message: "Message sent." });
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ message: "Failed to send message." });
    }
});

// Delete a message from a group (host only)
// DELETE http://localhost:3001/community/group/:groupId/messages/:messageId (Replace :groupId and :messageId with actual IDs)
// Requires user to be logged in and be the host of the group
router.delete("/group/:groupId/messages/:messageId", async (req, res) => {
    const groupId = req.params.groupId;
    const messageId = req.params.messageId;
    const userId = req.session.user_id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Check if user is the session host
        const hostCheck = await pool.query(
            "SELECT host_user_id FROM groups WHERE group_id = $1",
            [groupId]
        );

        if (hostCheck.rows.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        const hostId = hostCheck.rows[0].host_user_id;
        if (hostId !== userId) {
            return res.status(403).json({ message: "Only the session host can delete messages." });
        }

        // Delete the message
        await pool.query(
            "DELETE FROM group_messages WHERE message_id = $1 AND group_id = $2",
            [messageId, groupId]
        );

        res.status(200).json({ message: "Message deleted." });
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Edit the settings of a group session (host only)
router.put("/group/:groupId/edit", async (req, res) => {
    const userId = req.session.user_id;
    const groupId = req.params.groupId;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const {
        start_time,
        duration,
        session_type,
        max_players,
        platform,
        session_description
    } = req.body;

    try {
        // Check if the user is the host of the group
        const groupRes = await pool.query(
            "SELECT host_user_id FROM groups WHERE group_id = $1",
            [groupId]
        );

        if (groupRes.rowCount === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (groupRes.rows[0].host_user_id !== userId) {
            return res.status(403).json({ message: "Only the host can edit the group" });
        }

        // Make sure that current_players does not exceed max_players
        const currentPlayersRes = await pool.query(
            "SELECT current_players FROM groups WHERE group_id = $1",
            [groupId]
        );
        const currentPlayers = currentPlayersRes.rows[0].current_players;
        if (currentPlayers > max_players) {
            return res.status(400).json({ message: "Current number of players in the group exceed the new max players limit." });
        }

        // Perform the update
        await pool.query(
            `UPDATE groups
             SET start_time = $1,
                 duration = $2,
                 session_type = $3,
                 max_players = $4,
                 platform = $5,
                 session_description = $6
             WHERE group_id = $7`,
            [start_time, duration, session_type, max_players, platform, session_description, groupId]
        );

         // if current_players is equal to max_players, update the session_status to 'Closed'
         const maxPlayers = parseInt(max_players, 10);

         console.log("Current Players:", currentPlayers, "Max Players:", maxPlayers);
         
        if (currentPlayers === maxPlayers) {
             console.log("Updating session_status to 'Closed'");
             await pool.query(
                 "UPDATE groups SET session_status = 'Closed' WHERE group_id = $1",
                 [groupId]
             );
        }

        // If current_players is less than max_players, update the session_status to 'Open'
        if (currentPlayers < maxPlayers) {
            console.log("Updating session_status to 'Open'");
            await pool.query(
                "UPDATE groups SET session_status = 'Open' WHERE group_id = $1",
                [groupId]
            );
        }

        res.status(200).json({ message: "Group updated successfully" });
    } catch (err) {
        console.error("Error updating group:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get the next session for the logged-in user
router.get('/next-session', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    const user_id = req.session.user_id;

    try {
        const nextSessionQuery = await pool.query(
            `SELECT 
                g.group_id, 
                g.session_title, 
                g.start_time 
             FROM groups g
             JOIN group_members gm ON g.group_id = gm.group_id
             WHERE gm.user_id = $1 AND g.start_time > NOW()
             ORDER BY g.start_time ASC
             LIMIT 1`,
            [user_id]
        );

        if (nextSessionQuery.rows.length === 0) {
            return res.status(404).json({ message: "No upcoming sessions found." });
        }

        res.json(nextSessionQuery.rows[0]);
    } catch (err) {
        console.error("Error fetching next session:", err);
        res.status(500).json({ message: "Server error. Could not fetch next session." });
    }
});

router.get('/upcoming-groups', async (req, res) => {
    const { game_name } = req.query;

    if (!game_name) {
        console.log(" Missing game_name query param");
        return res.status(400).json({ message: "Missing game_name" });
    }

    try {
        console.log(" Fetching upcoming groups for:", game_name);

        const result = await pool.query(`
            SELECT g.*, u.username AS host_username
            FROM groups g
            JOIN users u ON g.host_user_id = u.user_id
            JOIN game_community gc ON g.community_id = gc.game_id
            WHERE LOWER(gc.game_name) = LOWER($1)
              AND g.start_time >= NOW()
            ORDER BY g.start_time ASC
            LIMIT 5
        `, [game_name]);

        console.log(" Query successful. Rows returned:", result.rows.length);
        return res.json(result.rows || []);
    } catch (err) {
        console.error(" SQL Error in /upcoming-groups:", err.message);
        return res.status(500).json({ message: "Failed to fetch upcoming groups." });
    }
});

module.exports = router;