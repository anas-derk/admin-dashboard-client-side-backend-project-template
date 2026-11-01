/* Line note: Initializes mongoose with require("mongoose"). */
const mongoose = require("mongoose");

const { dashboardDB } = require("../../../database/connections");

// Create Global Password Schema

/* Line note: Initializes global password schema with new mongoose.Schema({. */
const globalPasswordSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        validate: {
            /**
             * Function documentation: globalPasswordSchema
             * Purpose: Executes the global password schema server-side workflow.
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
        required: [true, "Password is required"],
        trim: true
    },
}, { timestamps: true });

globalPasswordSchema.index({ email: 1 }, { unique: true });

// Create Global Password Model From Global Password Schema

/* Line note: Initializes global password model with dashboardDB.model("global_password", globalPasswordSchema). */
const globalPasswordModel = dashboardDB.model("global_password", globalPasswordSchema);

module.exports = globalPasswordModel;