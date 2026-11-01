/* Line note: Initializes mongoose with require("mongoose"). */
const mongoose = require("mongoose");

mongoose.set({ runValidators: true });

/**
 * Function documentation: createConnection
 * Purpose: Creates connection after applying the required business rules.
 * Parameters: name.
 * Algorithm:
 * 1. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
const createConnection = (name) => {
    /* Line note: Initializes conn with mongoose.createConnection(). */
    const conn = mongoose.createConnection();
    conn.on("connected", () => console.log(`${name} DB Connected`));
    conn.on("disconnected", () => console.error(`${name} DB Disconnected`));
    conn.on("reconnected", () => console.warn(`${name} DB Reconnected`));
    conn.on("disconnecting", () => console.warn(`${name} DB Disconnecting`));
    conn.on("close", () => console.warn(`${name} DB Closed`));
    conn.on("error", (error) => {
        console.error(`${name} DB Error: ${error?.message ?? error}`);
    });
    /* Line note: Returns the prepared conn result to the caller. */
    return conn;
};

module.exports = {
    createConnection
}
