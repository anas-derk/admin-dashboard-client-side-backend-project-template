const mongoose = require("mongoose");

const { clientDB } = require("../../../database/connections");

const authSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true,
    },
    refreshTokenHash: {
        type: String,
        required: true,
        unique: true,
        select: false,
    },
    previousRefreshTokenHash: {
        type: String,
        default: null,
        select: false,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    revokedAt: {
        type: Date,
        default: null,
    },
    lastUsedAt: {
        type: Date,
        default: Date.now,
    },
    ip: {
        type: String,
        trim: true,
        default: "",
    },
    userAgent: {
        type: String,
        trim: true,
        default: "",
        maxlength: 512,
    },
}, { timestamps: true });

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
authSessionSchema.index({ previousRefreshTokenHash: 1 }, { sparse: true });
authSessionSchema.index({ user: 1, revokedAt: 1 });

module.exports = clientDB.model("auth_session", authSessionSchema);
