const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Middleware: Check if the user is an Admin
router.use((req, res, next) => {
    if (!req.session || !req.session.user_id || req.session.role?.toLowerCase() !== "admin") {
        console.warn("🚫 Blocked non-admin access or missing session:", req.session);
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
});

// ✅ Get Admin Profile
router.get("/me", async (req, res) => {
    try {
        console.log("🧾 Session data on /me:", req.session);

        const result = await pool.query(
            `SELECT username, email, 
             COALESCE(profile_picture, '/uploads/default-avatar.png') AS profile_picture 
             FROM users WHERE user_id = $1`,
            [req.session.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error fetching admin profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Update Admin Profile
router.put("/update-profile", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let updateQuery = `
            UPDATE users 
            SET username = $1, email = $2 
            WHERE user_id = $3 
            RETURNING username, email, profile_picture`;
        let params = [username, email, req.session.user_id];

        if (password && password.length > 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateQuery = `
                UPDATE users 
                SET username = $1, email = $2, password_hash = $3 
                WHERE user_id = $4 
                RETURNING username, email, profile_picture`;
            params = [username, email, hashedPassword, req.session.user_id];
        }

        const updatedAdmin = await pool.query(updateQuery, params);
        res.json({ message: "✅ Profile updated", admin: updatedAdmin.rows[0] });
    } catch (error) {
        console.error("❌ Error updating admin profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Multer Storage Setup for Profile Picture Upload
const storage = multer.diskStorage({
    destination: "public/uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Images only (JPEG, PNG, GIF) allowed."));
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

// ✅ Upload Admin Profile Picture
router.post("/upload-profile-picture", upload.single("profile_picture"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const newPicPath = `/uploads/${req.file.filename}`;
        const result = await pool.query("SELECT profile_picture FROM users WHERE user_id = $1", [req.session.user_id]);
        const oldPic = result.rows[0]?.profile_picture;

        await pool.query("UPDATE users SET profile_picture = $1 WHERE user_id = $2", [newPicPath, req.session.user_id]);

        if (oldPic && oldPic !== "/uploads/default-avatar.png") {
            const fullOldPath = path.join(__dirname, "..", "public", oldPic);
            if (fs.existsSync(fullOldPath)) {
                fs.unlinkSync(fullOldPath);
            }
        }

        res.status(200).json({ message: "✅ Profile picture updated", profile_picture: newPicPath });
    } catch (error) {
        console.error("❌ Error uploading profile picture:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Fetch Reports for Admin Review
router.get("/reports", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.report_id, 
                u1.username AS reported_user, 
                u2.username AS reported_by_user, 
                r.reason, 
                r.status
            FROM reports r
            JOIN users u1 ON r.reported_user_id = u1.user_id
            JOIN users u2 ON r.reported_by_user_id = u2.user_id
            ORDER BY r.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching reports:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Approve/Reject Reports
router.put("/reports/:report_id", async (req, res) => {
    const { report_id } = req.params;
    const { status } = req.body;

    try {
        const result = await pool.query(
            "UPDATE reports SET status = $1 WHERE report_id = $2 RETURNING *",
            [status, report_id]
        );

        res.json({ message: `✅ Report updated to ${status}`, report: result.rows[0] });
    } catch (error) {
        console.error("❌ Error updating report:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get All User Posts for Moderation
router.get("/posts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        up.post_id,
        up.post_content,
        up.created_at,
        up.status,
        u.username
      FROM user_posts up
      JOIN users u ON up.user_id = u.user_id
      ORDER BY up.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Get all users for Admin to review
router.get("/manage-users", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT user_id, username, email, role, 
                   COALESCE(status, 'active') AS status 
            FROM users
            WHERE role != 'admin'
            ORDER BY created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching users for ban/suspend:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get All Users for Ban/Suspend View
router.get("/users", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT user_id, username, email, role, status
            FROM users
            ORDER BY created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching users for ban/suspend:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get Chat History from user_posts_replies
router.get("/chat-history", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                upr.reply_id,
                upr.post_id,
                upr.user_id,
                upr.reply_content,
                upr.created_at,
                upr.parent_reply_id,
                u.username
            FROM user_posts_replies upr
            JOIN users u ON upr.user_id = u.user_id
            ORDER BY upr.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching chat history:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// ✅ Get all groups for admin view
router.get("/groups", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          g.group_id,
          g.session_title,
          g.created_at,
          g.max_players,
          g.current_players,
          u.username AS host_username
        FROM groups g
        LEFT JOIN users u ON g.host_user_id = u.user_id
        ORDER BY g.created_at DESC
      `);
  
      res.json(result.rows);
    } catch (error) {
      console.error("❌ Error fetching groups:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ✅ Fetch All Game Communities
router.get("/communities", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT game_id, game_name, cover_image_url, description, created_at
        FROM game_community
        ORDER BY created_at DESC
      `);
  
      res.json(result.rows);
    } catch (error) {
      console.error("❌ Error fetching game communities:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

 // ✅ Get All Gamer Profiles (Corrected)
router.get("/gamer-profiles", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT gp.gamer_id, gp.user_id, gp.steam_username, gp.psn_id, gp.xbox_id,
               gp.avatar_url, gp.created_at, gp.steam64_id,
               u.username
        FROM gamer_profiles gp
        JOIN users u ON gp.user_id = u.user_id
        ORDER BY gp.created_at DESC
      `);
  
      res.json(result.rows);
    } catch (error) {
      console.error("❌ Error fetching gamer profiles:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ✅ Analytics Overview Endpoint
router.get("/analytics-overview", async (req, res) => {
    try {
      const userCountQuery = pool.query(`SELECT COUNT(*) AS total_users FROM users`);
      const activeGroupsQuery = pool.query(`SELECT COUNT(*) AS active_groups FROM groups WHERE session_status = 'active'`);
      const flaggedPostsQuery = pool.query(`SELECT COUNT(*) AS flagged_posts FROM reports WHERE status = 'pending'`);
      const suspendedUsersQuery = pool.query(`SELECT COUNT(*) AS suspended_users FROM users WHERE status = 'suspended'`);
  
      const [userCount, activeGroups, flaggedPosts, suspendedUsers] = await Promise.all([
        userCountQuery,
        activeGroupsQuery,
        flaggedPostsQuery,
        suspendedUsersQuery
      ]);
  
      res.json({
        total_users: parseInt(userCount.rows[0].total_users),
        active_groups: parseInt(activeGroups.rows[0].active_groups),
        flagged_posts: parseInt(flaggedPosts.rows[0].flagged_posts),
        suspended_users: parseInt(suspendedUsers.rows[0].suspended_users)
      });
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
      res.status(500).json({ message: "Error fetching analytics overview" });
    }
  });
  
// Fix this route in admin.js
router.put('/communities/:id', async (req, res) => {
    const { id } = req.params;
    const { game_name, cover_image_url, description } = req.body;
  
    try {
      await pool.query(
        `UPDATE game_community 
         SET game_name = $1, cover_image_url = $2, description = $3 
         WHERE game_id = $4`,
        [game_name, cover_image_url, description, id]
      );
      console.log(`✅ Game ${id} updated successfully`);
      res.status(200).json({ message: "✅ Game updated successfully" });

    } catch (err) {
      console.error("❌ Error updating community:", err);
      res.status(500).json({ error: "Failed to update community" });
    }
  });
  

// ✅ DELETE a user post
router.delete("/posts/:postId", async (req, res) => {
    const { postId } = req.params;
    try {
      await pool.query("DELETE FROM user_posts WHERE post_id = $1", [postId]);
      res.json({ message: "✅ Post deleted" });
    } catch (err) {
      console.error("❌ Error deleting post:", err);
      res.status(500).json({ message: "Error deleting post" });
    }
  });
  
  // ✅ FLAG a post (update status)
  router.put("/posts/:postId/flag", async (req, res) => {
    const { postId } = req.params;
    try {
      await pool.query(
        "UPDATE user_posts SET status = 'flagged' WHERE post_id = $1",
        [postId]
      );
      res.json({ message: "✅ Post flagged" });
    } catch (err) {
      console.error("❌ Error flagging post:", err);
      res.status(500).json({ message: "Error flagging post" });
    }
  });

// Sessions Load! 
router.get("/sessions", async (req, res) => {
    try {
      const result = await pool.query("SELECT sid, sess, expire FROM session");
  
      const sessions = result.rows.map(row => {
        let sessStr = row.sess;
        if (Buffer.isBuffer(sessStr)) {
          sessStr = sessStr.toString("utf8");
        }
  
        return {
          sid: row.sid,
          sess: sessStr,
          expire: row.expire
        };
      });
  
      res.json(sessions);
    } catch (err) {
      console.error("❌ Error loading sessions:", err);
      res.status(500).json({ error: "Failed to fetch session logs" });
    }
  });
  

 // ✅ ADD NEW GAME COMMUNITY with Image Upload
const communityStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      const dir = path.join(__dirname, "../public/uploads/community");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
  },
  filename: (req, file, cb) => {
      const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
      cb(null, unique);
  }
});

const communityUpload = multer({ storage: communityStorage });

router.post("/communities", communityUpload.single("cover_image"), async (req, res) => {
  try {
      const { game_name, description } = req.body;
      const file = req.file;

      if (!game_name || !description || !file) {
          return res.status(400).json({ error: "Missing required fields" });
      }

      const imagePath = `/uploads/community/${file.filename}`;
      const result = await pool.query(`
          INSERT INTO game_community (game_name, cover_image_url, description, created_at)
          VALUES ($1, $2, $3, NOW())
          RETURNING *;
      `, [game_name, imagePath, description]);

      res.status(201).json(result.rows[0]);
  } catch (err) {
      console.error("❌ Error adding game community:", err);
      res.status(500).json({ error: "Failed to add new game community" });
  }
});


// ✅ Update User Status (Ban/Suspend)
router.put("/users/:userId/status", async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET status = $1 WHERE user_id = $2 RETURNING user_id, username, status`,
      [status, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: `User status updated to ${status}`, user: result.rows[0] });
  } catch (err) {
    console.error("❌ Error updating user status:", err);
    res.status(500).json({ error: "Failed to update user status" });
  }
});


// ✅ Route to save snapshot of analytics data
router.post("/analytics-overview/save", async (req, res) => {
  const { total_users, active_groups, flagged_posts, suspended_users } = req.body;

  try {
    await pool.query(
      `INSERT INTO admin_analytics_overview 
       (total_users, active_groups, flagged_posts, suspended_users)
       VALUES ($1, $2, $3, $4)`,
      [total_users, active_groups, flagged_posts, suspended_users]
    );

    res.status(201).json({ message: "✅ Analytics snapshot saved" });
  } catch (err) {
    console.error("❌ Failed to save analytics:", err);
    res.status(500).json({ message: "Server error saving analytics" });
  }
});

router.get("/next-session", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM groups 
      WHERE session_status = 'active' 
      ORDER BY start_time ASC 
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No upcoming sessions found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching next session:", err);
    res.status(500).json({ message: "Failed to fetch next session" });
  }
});


module.exports = router;
