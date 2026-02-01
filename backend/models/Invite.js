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
        expires: 300, // Expires in 5 minutes
    },
});

module.exports = mongoose.model("Invite", inviteSchema);
