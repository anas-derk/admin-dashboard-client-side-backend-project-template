const mongoose = require("mongoose");

const { dashboardDB } = require("../../../database/connections");

const loginLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "User id is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
    },
    ip: {
        type: String,
        trim: true,
        default: "",
    },
}, { timestamps: true });

loginLogSchema.index({ createdAt: -1 });
loginLogSchema.index({ email: 1, createdAt: -1 });
loginLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = dashboardDB.model("user_login_log", loginLogSchema);
