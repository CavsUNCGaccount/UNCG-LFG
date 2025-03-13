const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Middleware: Check if the user is an Admin
router.use((req, res, next) => {
    if (!req.session.user_id || req.session.role?.toLowerCase() !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
});

// ✅ Get Admin Profile
router.get("/me", async (req, res) => {
    try {
        const admin = await pool.query(
            "SELECT username, email, COALESCE(profile_picture, '/uploads/default-avatar.png') AS profile_picture FROM users WHERE user_id = $1",
            [req.session.user_id]
        );

        if (admin.rows.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json(admin.rows[0]);
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Update Admin Profile
router.put("/update-profile", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let updateQuery = "UPDATE users SET username = $1, email = $2 WHERE user_id = $3 RETURNING username, email, profile_picture";
        let params = [username, email, req.session.user_id];

        if (password && password.length > 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateQuery = "UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE user_id = $4 RETURNING username, email, profile_picture";
            params = [username, email, hashedPassword, req.session.user_id];
        }

        const updatedAdmin = await pool.query(updateQuery, params);
        res.json({ message: "Profile updated successfully", admin: updatedAdmin.rows[0] });

    } catch (error) {
        console.error("Error updating admin profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Multer Setup for Profile Picture Upload
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
        cb(new Error("Images only (JPEG, PNG, GIF)."));
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// ✅ Upload Admin Profile Picture
router.post("/upload-profile-picture", upload.single("profile_picture"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const profilePicturePath = `/uploads/${req.file.filename}`;

        const oldProfileQuery = await pool.query("SELECT profile_picture FROM users WHERE user_id = $1", [req.session.user_id]);
        const oldProfilePic = oldProfileQuery.rows[0]?.profile_picture;

        await pool.query(
            "UPDATE users SET profile_picture = $1 WHERE user_id = $2",
            [profilePicturePath, req.session.user_id]
        );

        if (oldProfilePic && oldProfilePic !== "/uploads/default-avatar.png") {
            const oldFilePath = path.join(__dirname, "..", "public", oldProfilePic);
            fs.access(oldFilePath, fs.constants.F_OK, (err) => {
                if (!err) fs.unlink(oldFilePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Failed to delete old profile picture:", unlinkErr);
                });
            });
        }

        res.status(200).json({ message: "Profile picture updated", profile_picture: profilePicturePath });
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Fetch Reports for Admin Review
router.get("/reports", async (req, res) => {
    try {
        const reports = await pool.query(`
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

        res.json(reports.rows);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Approve/Reject Reports (Admin Action)
router.put("/reports/:report_id", async (req, res) => {
    const { report_id } = req.params;
    const { status } = req.body;

    try {
        const result = await pool.query(
            "UPDATE reports SET status = $1 WHERE report_id = $2 RETURNING *",
            [status, report_id]
        );

        res.json({ message: `Report updated to ${status}`, report: result.rows[0] });
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
