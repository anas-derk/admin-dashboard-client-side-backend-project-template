/* Line note: Initializes mongoose with require("mongoose"). */
const mongoose = require("mongoose");

const { clientDB } = require("../../../database/connections");

const { TYPES_OF_USE_VERIFICATION_CODE, DEFAULT_TYPES_OF_USE_VERIFICATION_CODE, MAX_ATTEMPTS, LOCK_DURATIONS } = require("../../../constants/verification_codes");

/**
 * isValidDateOrTimestamp
 *
 * Purpose: Determines whether valid date or timestamp satisfies the required server rules.
 * Parameters: v.
 * Algorithm:
 * 1. Returns the resulting record, response object, validation decision, or calculated value.
 * Returns: The resulting record, response, decision, or calculated value.
 */
function isValidDateOrTimestamp(v) {
    /* Line note: Checks whether !v and executes the matching business, validation, or authorization branch. */
    if (!v) return true;
    /* Line note: Stores date for reuse by the remaining server-side workflow. */
    const date = v instanceof Date ? v : new Date(v);
    /* Line note: Returns !isNaN(date.getTime()) to the caller as the result of this server-side workflow. */
    return !isNaN(date.getTime());
}

// Create Verification Code Schema

const verificationCodeSchema = new mongoose.Schema({
    session: {
        type: mongoose.Types.ObjectId,
        required: [true, "Session is required"],
        validate: {
            validator: mongoose.Types.ObjectId.isValid,
            message: "Invalid Session Id"
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                /* Line note: Checks whether !v and executes the matching business, validation, or authorization branch. */
                if (!v) return true;
                /* Line note: Returns /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) to the caller as the result of this server-side workflow. */
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Invalid email format"
        }
    },
    code: {
        type: String,
        required: [true, "Verification code is required"],
        trim: true,
    },
    lastSentAt: {
        type: Date,
        default: Date.now,
        validate: {
            validator: isValidDateOrTimestamp,
            message: "lastSentAt must be a valid date"
        }
    },
    expiresAt: {
        type: Date,
        required: [true, "Expiration date is required"],
        validate: {
            validator: isValidDateOrTimestamp
        }
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date,
        required: function () {
            /* Line note: Returns this.verified to the caller as the result of this server-side workflow. */
            return this.verified;
        },
        validate: {
            validator: function (v) {
                /* Line note: Checks whether !v and executes the matching business, validation, or authorization branch. */
                if (!v) return true;
                /* Line note: Returns isValidDateOrTimestamp(v) to the caller as the result of this server-side workflow. */
                return isValidDateOrTimestamp(v);
            },
            message: "verifiedAt must be a valid date"
        }
    },
    sentCount: {
        type: Number,
        default: 1,
        min: [0, "sentCount cannot be negative"]
    },
    attemptsCount: {
        type: Number,
        default: 0,
        min: [0, "attemptsCount cannot be negative"],
        max: [MAX_ATTEMPTS, `attemptsCount cannot exceed ${MAX_ATTEMPTS}`]
    },
    attemptWindowStartedAt: {
        type: Date,
        validate: {
            validator: function (v) {
                /* Line note: Checks whether !v and executes the matching business, validation, or authorization branch. */
                if (!v) return true;
                /* Line note: Returns isValidDateOrTimestamp(v) to the caller as the result of this server-side workflow. */
                return isValidDateOrTimestamp(v);
            },
            message: "attemptWindowStartedAt must be a valid date"
        }
    },
    lastAttemptAt: {
        type: Date,
        validate: {
            validator: function (v) {
                /* Line note: Checks whether !v and executes the matching business, validation, or authorization branch. */
                if (!v) return true;
                /* Line note: Returns isValidDateOrTimestamp(v) to the caller as the result of this server-side workflow. */
                return isValidDateOrTimestamp(v);
            },
            message: "lastAttemptAt must be a valid date"
        }
    },
    lockLevel: {
        type: Number,
        min: [0, "lockLevel cannot be negative"],
        max: [LOCK_DURATIONS.length, `lockLevel cannot exceed ${LOCK_DURATIONS.length}`]
    },
    blockedUntil: {
        type: Date,
        validate: {
            validator: function (v) {
                /* Line note: Checks whether !v and executes the matching business, validation, or authorization branch. */
                if (!v) return true;
                /* Line note: Returns isValidDateOrTimestamp(v) to the caller as the result of this server-side workflow. */
                return isValidDateOrTimestamp(v);
            },
            message: "blockedUntil must be a valid date"
        }
    },
    typeOfUse: {
        type: String,
        enum: {
            values: TYPES_OF_USE_VERIFICATION_CODE,
            message: "Invalid typeOfUse"
        },
        default: DEFAULT_TYPES_OF_USE_VERIFICATION_CODE,
        trim: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        validate: {
            validator: function (v) {
                /* Line note: Checks whether !v and executes the matching business, validation, or authorization branch. */
                if (!v) return true;
                /* Line note: Returns mongoose.Types.ObjectId.isValid(v) to the caller as the result of this server-side workflow. */
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: "Invalid User Id"
        }
    }
}, { timestamps: true });

verificationCodeSchema.index({ session: 1 });

verificationCodeSchema.index({ email: 1 });

verificationCodeSchema.index({ verified: 1 });

verificationCodeSchema.index({ expiresAt: 1 });

verificationCodeSchema.index({ createdAt: -1 });

verificationCodeSchema.index({
    email: 1,
    typeOfUse: 1,
    session: 1
});

// Create Verification Code Model From Verification Code Schema

const verificationCodeModel = clientDB.model("verification_codes", verificationCodeSchema);

module.exports = verificationCodeModel;