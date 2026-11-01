/* Line note: Initializes mongoose with require("mongoose"). */
const mongoose = require("mongoose");
const { clientDB, dashboardDB } = require("../database/connections");
/* Line note: Initializes client models with require("./client"). */
const clientModels = require("./client");
/* Line note: Initializes dashboard models with require("./dashboard"). */
const dashboardModels = require("./dashboard");

/**
 * Function documentation: startDBSession
 * Purpose: Executes the start dbsession server-side workflow.
 * Parameters: None.
 * Algorithm:
 * 1. Runs related database mutations in a MongoDB transaction so they commit or roll back together.
 * 2. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
async function startDBSession() {
    /* Line note: Initializes db session with await clientDB.startSession(). */
    const dbSession = await clientDB.startSession();
    dbSession.startTransaction();
    /* Line note: Returns the prepared db session result to the caller. */
    return dbSession;
}

/**
 * Function documentation: commitDBSession
 * Purpose: Executes the commit dbsession server-side workflow.
 * Parameters: dbSession.
 * Algorithm:
 * 1. Processes db session and applies the commit dbsession workflow.
 * Returns: No explicit value.
 */
async function commitDBSession(dbSession) {
    /* Line note: Checks the following business or authorization condition before continuing. */
    if (dbSession) {
        await dbSession.commitTransaction();
        await dbSession.endSession();
    }
}

/**
 * Function documentation: abortDBSession
 * Purpose: Executes the abort dbsession server-side workflow.
 * Parameters: dbSession.
 * Algorithm:
 * 1. Processes db session and applies the abort dbsession workflow.
 * Returns: No explicit value.
 */
async function abortDBSession(dbSession) {
    /* Line note: Checks the following business or authorization condition before continuing. */
    if (dbSession) {
        await dbSession.abortTransaction();
        await dbSession.endSession();
    }
}

mongoose.startDBSession = startDBSession;
mongoose.commitDBSession = commitDBSession;
mongoose.abortDBSession = abortDBSession;

module.exports = {
    clientModels,
    dashboardModels,
    ...clientModels,
    ...dashboardModels,
    clientDB,
    dashboardDB,
    mongoose,
};

