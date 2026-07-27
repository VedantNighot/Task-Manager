const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc Get all users (Admin Only)
// @route Get /api/users/
// @access Private (Admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'member' }).select("-password");
        // Add task counts to each other
        const usersWithTaskCounts = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: "Pending" });
            const inProgressTasks = await Task.countDocuments({ assignedTo: user._id, status: "In Progress" });
            const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: "Completed" });

            return {
                ...user._doc,//Inlcude all existing user data
                pendingTasks,
                inProgressTasks,
                completedTasks,
            };
        }));
        res.json(usersWithTaskCounts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
// @desc Get user by Id
// @route Get /api/users/:id
// @access Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}
// @desc Delet a user (Admin Only)
// @route DELETE /api/users/:id
// @access Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Use deleteOne() to remove the document
        await user.deleteOne();

        // Also remove tasks assigned to this user? Or reassign? 
        // For now, we'll keep tasks but they might have null assignee or we should handle it.
        // Simple removal is fine for now.

        res.json({ message: "User removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getUsers, getUserById, deleteUser }