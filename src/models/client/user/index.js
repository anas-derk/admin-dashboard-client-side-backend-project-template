/* Line note: Initializes mongoose with require("mongoose"). */
const mongoose = require("mongoose");

const { clientDB } = require("../../../database/connections");

const { LANGUAGES, DEFAULT_LANGUAGE } = require("../../../constants/languages");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "Email is required"],
        validate: {
            /**
             * Function documentation: userSchema
             * Purpose: Executes the user schema server-side workflow.
             * Parameters: v.
             * Algorithm:
             * 1. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
             * Returns: The resulting entity, response, decision, or calculated value.
             */
            validator: function (v) {
                /* Line note: Returns the result of the server-side calculation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v). */
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Invalid email format"
        }
    },
    password: {
        type: String,
        select: false,
        /**
         * Function documentation: userSchema
         * Purpose: Executes the user schema server-side workflow.
         * Parameters: None.
         * Algorithm:
         * 1. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
         * Returns: The resulting entity, response, decision, or calculated value.
         */
        required: [function () { return this.provider === "same-site"; }, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        maxlength: [128, "Password cannot exceed 128 characters"],
        validate: {
            /**
             * Function documentation: userSchema
             * Purpose: Executes the user schema server-side workflow.
             * Parameters: v.
             * Algorithm:
             * 1. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
             * Returns: The resulting entity, response, decision, or calculated value.
             */
            validator: function (v) {
                /* Line note: Checks the following business or authorization condition before continuing. */
                if (!v && this.provider !== "same-site") return true;
                /* Line note: Checks the following business or authorization condition before continuing. */
                if (/^\$2[aby]\$/.test(v)) return true;
                /* Line note: Returns the result of the server-side calculation: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(v). */
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(v);
            },
            message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        }
    },
    provider: {
        type: String,
        trim: true,
        default: "same-site",
        enum: {
            values: ["same-site", "google"],
            message: "Invalid provider"
        }
    },
    googleSub: {
        type: String,
        trim: true,
        select: false,
        required: [function () { return this.provider === "google"; }, "Google subject is required"],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String,
        trim: true,
        default: "",
        maxlength: [50, "First name cannot exceed 50 characters"]
    },
    lastName: {
        type: String,
        trim: true,
        default: "",
        maxlength: [50, "Last name cannot exceed 50 characters"]
    },
    imagePath: {
        type: String,
        trim: true,
        default: "/images/defaultProfileImage.png"
    },
    language: {
        type: String,
        enum: {
            values: LANGUAGES,
            message: "Invalid language"
        },
        default: DEFAULT_LANGUAGE
    },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleSub: 1 }, { unique: true, sparse: true });
userSchema.index({ provider: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ createdAt: -1 });

const userModel = clientDB.model("user", userSchema);

module.exports = userModel;
