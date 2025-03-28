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

/* ========================= User Posts ========================= */
// Create a new post
router.post('/create-post', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
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
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
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

/* ========================= Look for Groups ========================= */

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
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    const { game_name, session_title, session_description, platform, session_type, session_status, max_players, start_time, duration } = req.body;
    const user_id = req.session.user_id;

    if (!game_name || !session_title || !session_description || !platform || !session_type || !session_status || !max_players || !start_time || !duration) {
        return res.status(400).json({ message: "All required fields must be provided." });
    }

    try {
        // Get community_id from game_name
        const gameQuery = await pool.query("SELECT game_id FROM game_community WHERE game_name = $1", [game_name]);
        if (gameQuery.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }
        const community_id = gameQuery.rows[0].game_id;

        // Insert the new group session into the `groups` table
        const newGroup = await pool.query(
            `INSERT INTO groups 
                (community_id, host_user_id, session_title, session_description, platform, session_type, session_status, max_players, start_time, duration) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [community_id, user_id, session_title, session_description, platform, session_type, session_status, max_players, start_time, duration]
        );

        res.status(201).json(newGroup.rows[0]);
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

// Join a group session
router.post('/join-group', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    const { group_id } = req.body;
    const user_id = req.session.user_id;

    if (!group_id) {
        return res.status(400).json({ message: "Group ID is required." });
    }

    try {
        // Check if the group exists and has available spaces
        const groupQuery = await pool.query("SELECT max_players, current_players FROM groups WHERE group_id = $1", [group_id]);
        if (groupQuery.rows.length === 0) {
            return res.status(404).json({ message: "Group not found." });
        }

        const { max_players, current_players } = groupQuery.rows[0];
        if (current_players >= max_players) {
            return res.status(400).json({ message: "No spaces left in this group." });
        }

        // Add the user to the group
        await pool.query(
            "INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)",
            [group_id, user_id]
        );

        // Increment the current players count
        await pool.query(
            "UPDATE groups SET current_players = current_players + 1 WHERE group_id = $1",
            [group_id]
        );

        res.status(200).json({ message: "Successfully joined the group." });
    } catch (err) {
        console.error("Error joining group:", err);
        res.status(500).json({ message: "Server error. Could not join group." });
    }
});

module.exports = router;