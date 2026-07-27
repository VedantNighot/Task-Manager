const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profileImageUrl: { type: String, default: null },
        role: { type: String, enum: ["admin", "member"], default: "member" }, //Role-Based access
        isMasterAdmin: { type: Boolean, default: false },
        pushSubscriptions: [
            {
                endpoint: { type: String, required: true },
                expirationTime: { type: Number, default: null },
                keys: {
                    p256dh: { type: String, required: true },
                    auth: { type: String, required: true }
                }
            }
        ]
    }, { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);