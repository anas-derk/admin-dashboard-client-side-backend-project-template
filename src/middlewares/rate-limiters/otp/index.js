const { createHash } = require("crypto");

const {
    sendOtpRateLimiter,
    verifyOtpIpRateLimiter,
    verifyOtpSessionRateLimiter,
} = require("../../../config/rate-limiters/otp");

/**
 * Function documentation: sendRateLimitResponse
 * Purpose: Executes the send rate limit response server-side workflow.
 * Parameters: res, rejRes.
 * Algorithm:
 * 1. Reads or updates Redis-backed rate-limit or cached state for the request.
 * 2. Sends the appropriate HTTP status and JSON payload back to the client.
 * 3. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
function sendRateLimitResponse(res, rejRes) {
    const retryAfter = Math.max(1, Math.ceil(rejRes.msBeforeNext / 1000));
    res.set("Retry-After", String(retryAfter));

    /* Line note: Returns res.status(429).json({ to the caller. */
    return res.status(429).json({
        status: false,
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests !!",
        data: {
            retryAfter,
        },
    });
}

function getIpAddress(req) {
    return req.ip || req.socket?.remoteAddress || "unknown";
}

function createRateLimitKey(...parts) {
    return createHash("sha256")
        .update(parts.map((part) => String(part || "unknown").trim().toLowerCase()).join(":"))
        .digest("hex");
}

function handleRateLimiterRejection(rejection, res, next) {
    if (typeof rejection?.msBeforeNext !== "number") return next(rejection);
    return sendRateLimitResponse(res, rejection);
}

/**
 * Function documentation: sendOtpRateLimitMiddleware
 * Purpose: Executes the send otp rate limit middleware server-side workflow.
 * Parameters: req, res, next.
 * Algorithm:
 * 1. Reads the required body, query, and route parameters from the incoming HTTP request.
 * 2. Reads or updates Redis-backed rate-limit or cached state for the request.
 * 3. Catches database, provider, filesystem, or processing failures and returns or propagates a controlled error.
 * Returns: No explicit value.
 */
const sendOtpRateLimitMiddleware = async (req, res, next) => {
    /* Line note: Reads email from the request body. */
    const email = req.body?.email || req.query?.email;
    /* Line note: Reads type of use from the request body. */
    const typeOfUse = req.body?.typeOfUse || req.query?.typeOfUse;
    const key = createRateLimitKey(getIpAddress(req), typeOfUse, email);
    /* Line note: Starts a protected server operation whose failures are handled below. */
    try {
        await sendOtpRateLimiter.consume(key);
        return next();
    }
    /* Line note: Handles a failure raised by the protected server operation. */
    catch (rejection) {
        return handleRateLimiterRejection(rejection, res, next);
    }
};

/**
 * Function documentation: verifyOtpRateLimitMiddleware
 * Purpose: Executes the verify otp rate limit middleware server-side workflow.
 * Parameters: req, res, next.
 * Algorithm:
 * 1. Reads the required body, query, and route parameters from the incoming HTTP request.
 * 2. Reads or updates Redis-backed rate-limit or cached state for the request.
 * 3. Catches database, provider, filesystem, or processing failures and returns or propagates a controlled error.
 * Returns: No explicit value.
 */
const verifyOtpRateLimitMiddleware = async (req, res, next) => {
    const ipAddress = getIpAddress(req);
    const session = req.body?.session || req.query?.session;
    const ipKey = createRateLimitKey(ipAddress);
    const sessionKey = createRateLimitKey(session);
    /* Line note: Starts a protected server operation whose failures are handled below. */
    try {
        await verifyOtpIpRateLimiter.consume(ipKey);
        await verifyOtpSessionRateLimiter.consume(sessionKey);
        return next();
    }
    /* Line note: Handles a failure raised by the protected server operation. */
    catch (rejection) {
        return handleRateLimiterRejection(rejection, res, next);
    }
};

module.exports = {
    createRateLimitKey,
    sendOtpRateLimitMiddleware,
    verifyOtpRateLimitMiddleware,
};
