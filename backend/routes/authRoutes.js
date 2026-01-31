const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword, generateInviteCode } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

// Auth Routes

router.post("/register", registerUser); //Register User
router.post("/login", loginUser); //Login User
router.get("/profile", protect, getUserProfile); //Get user Profile
router.put("/profile", protect, updateUserProfile); //Update Profile
router.post("/change-password", protect, changePassword); //Change Password
router.post("/generate-invite", protect, generateInviteCode); //Generate Admin Invite

router.post("/upload-image", upload.single("image"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});
module.exports = router;