const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // Expires in 24 hours
    },
});

module.exports = mongoose.model("Invite", inviteSchema);
