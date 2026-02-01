const User = require("../models/User");
const Invite = require("../models/Invite");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate Web Token

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
// desc Register a new User
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

        // Check if user is already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // determine user role: Admin if correct token is provided
        let role = "member";
        let isMasterAdmin = false;

        if (adminInviteToken) {
            const masterToken = "16032004";
            if (adminInviteToken === masterToken || (process.env.ADMIN_INVITE_TOKEN && adminInviteToken === process.env.ADMIN_INVITE_TOKEN)) {
                role = "admin";
                isMasterAdmin = true;
            } else {
                // Check dynamic invite
                const invite = await Invite.findOne({ code: adminInviteToken, isUsed: false });

                if (invite) {
                    // Explicitly check for 5-minute expiration
                    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                    if (invite.createdAt < fiveMinutesAgo) {
                        return res.status(400).json({ message: "Invite code has expired" });
                    }

                    role = "admin";
                    isMasterAdmin = false;
                    invite.isUsed = true;
                    await invite.save();
                } else {
                    return res.status(400).json({ message: "Invalid or already used Admin Invite Token" });
                }
            }
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role,
            isMasterAdmin,
        });

        // Return user data with jwt
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isMasterAdmin: user.isMasterAdmin,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
};

// @desc Login User
// @route POST /api/auth/registeer
// @access Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Return user data with JWT
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
};

// @desc Get User Profile
// @route POST /api/auth/profile
// @access Private (Requires JWT)
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
};

// @desc Update User
// @route POST /api/auth/profile
// @access Private (Require JWT)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.profileImageUrl = req.body.profileImageUrl || user.profileImageUrl;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profileImageUrl: updatedUser.profileImageUrl,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
};

// @desc Change User Password
// @route POST /api/auth/change-password
// @access Private (Returns JWT)
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, accessToken } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify Access Token (Extra Security)
        const validAccessToken = process.env.ACCESS_TOKEN_SECRET || "admin123"; // Fallback for dev
        if (accessToken !== validAccessToken) {
            return res.status(403).json({ message: "Invalid Access Token" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Generate Admin Invite Code
// @route POST /api/auth/generate-invite
// @access Private (Admin Only)
const generateInviteCode = async (req, res) => {
    try {
        // Ensure only MASTER admin can generate
        const user = await User.findById(req.user.id);
        if (!user || !user.isMasterAdmin) {
            return res.status(403).json({ message: "Not authorized. Only Master Admins can generate invites." });
        }

        const code = crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g. "8F3A2B1C"

        await Invite.create({
            code,
            createdBy: user._id,
        });

        res.json({ message: "Invite code generated", code });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword, generateInviteCode };
