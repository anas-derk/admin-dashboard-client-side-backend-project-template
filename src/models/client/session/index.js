const mongoose = require("mongoose");

const { clientDB } = require("../../../database/connections");

const { TYPES_OF_USE_VERIFICATION_CODE, DEFAULT_TYPES_OF_USE_VERIFICATION_CODE } = require("../../../constants/verification_codes");

/**
 * isValidEmail
 *
 * Purpose: Determines whether valid email satisfies the required server rules.
 * Parameters: v.
 * Algorithm:
 * 1. Returns the resulting record, response object, validation decision, or calculated value.
 * Returns: The resulting record, response, decision, or calculated value.
 */
function isValidEmail(v) {
    /* Line note: Checks whether !v and executes the matching business, validation, or authorization branch. */
    if (!v) return true;
    /* Line note: Returns /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) to the caller as the result of this server-side workflow. */
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Create Session Schema

const sessionSchema = new mongoose.Schema({
    typeOfUse: {
        type: String,
        enum: {
            values: TYPES_OF_USE_VERIFICATION_CODE,
            message: "Invalid typeOfUse, must be one of " + TYPES_OF_USE_VERIFICATION_CODE.join(", ")
        },
        default: DEFAULT_TYPES_OF_USE_VERIFICATION_CODE,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        validate: {
            validator: isValidEmail,
            message: "Invalid email format"
        }
    },
}, { timestamps: true });

sessionSchema.index({ email: 1 });

sessionSchema.index({ typeOfUse: 1 });

sessionSchema.index({ email: 1, typeOfUse: 1 });

sessionSchema.index({ createdAt: -1 });

// Create Session Model From Session Schema

const sessionModel = clientDB.model("session", sessionSchema);

module.exports = sessionModel;