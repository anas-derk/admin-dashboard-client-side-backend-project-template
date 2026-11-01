const {
    loginRateLimiter,
    forgotPasswordRateLimiter,
    refreshTokenRateLimiter,
    resetPasswordRateLimiter,
} = require("../../../config/rate-limiters/auth");

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

function handleRateLimiterRejection(error, res, next) {
    if (typeof error?.msBeforeNext !== "number") return next(error);
    return sendRateLimitResponse(res, error);
}

/**
 * Function documentation: loginRateLimitMiddleware
 * Purpose: Executes the login rate limit middleware server-side workflow.
 * Parameters: req, res, next.
 * Algorithm:
 * 1. Reads the required body, query, and route parameters from the incoming HTTP request.
 * 2. Reads or updates Redis-backed rate-limit or cached state for the request.
 * 3. Catches database, provider, filesystem, or processing failures and returns or propagates a controlled error.
 * Returns: No explicit value.
 */
const loginRateLimitMiddleware = async (req, res, next) => {
    /* Line note: Reads email from the request body. */
    const email = req.body?.email || req.query?.email;
    /* Line note: Initializes key with `${req.ip}_${email || "unknown"}`. */
    const key = `${req.ip}_${email || "unknown"}`;
    /* Line note: Starts a protected server operation whose failures are handled below. */
    try {
        await loginRateLimiter.consume(key);
        next();
    }
    /* Line note: Handles a failure raised by the protected server operation. */
    catch (rejRes) {
        return handleRateLimiterRejection(rejRes, res, next);
    }
};

/**
 * Function documentation: forgotPasswordRateLimitMiddleware
 * Purpose: Executes the forgot password rate limit middleware server-side workflow.
 * Parameters: req, res, next.
 * Algorithm:
 * 1. Reads the required body, query, and route parameters from the incoming HTTP request.
 * 2. Reads or updates Redis-backed rate-limit or cached state for the request.
 * 3. Catches database, provider, filesystem, or processing failures and returns or propagates a controlled error.
 * Returns: No explicit value.
 */
const forgotPasswordRateLimitMiddleware = async (req, res, next) => {
    /* Line note: Reads email from the request body. */
    const email = req.body?.email || req.query?.email;
    /* Line note: Reads user type from the request body. */
    const userType = req.body?.userType || req.query?.userType;
    /* Line note: Initializes key with `${req.ip}_${userType || "unknown"}_${email || "unknown"}`. */
    const key = `${req.ip}_${userType || "unknown"}_${email || "unknown"}`;
    /* Line note: Starts a protected server operation whose failures are handled below. */
    try {
        await forgotPasswordRateLimiter.consume(key);
        next();
    }
    /* Line note: Handles a failure raised by the protected server operation. */
    catch (rejRes) {
        return handleRateLimiterRejection(rejRes, res, next);
    }
};

/**
 * Function documentation: resetPasswordRateLimitMiddleware
 * Purpose: Executes the reset password rate limit middleware server-side workflow.
 * Parameters: req, res, next.
 * Algorithm:
 * 1. Reads the required body, query, and route parameters from the incoming HTTP request.
 * 2. Reads or updates Redis-backed rate-limit or cached state for the request.
 * 3. Catches database, provider, filesystem, or processing failures and returns or propagates a controlled error.
 * Returns: No explicit value.
 */
const resetPasswordRateLimitMiddleware = async (req, res, next) => {
    /* Line note: Reads email from the request body. */
    const email = req.body?.email || req.query?.email;
    /* Line note: Reads user type from the request body. */
    const userType = req.body?.userType || req.query?.userType;
    /* Line note: Initializes key with `${req.ip}_${userType || "unknown"}_${email || "unknown"}`. */
    const key = `${req.ip}_${userType || "unknown"}_${email || "unknown"}`;
    /* Line note: Starts a protected server operation whose failures are handled below. */
    try {
        await resetPasswordRateLimiter.consume(key);
        next();
    }
    /* Line note: Handles a failure raised by the protected server operation. */
    catch (rejRes) {
        return handleRateLimiterRejection(rejRes, res, next);
    }
};

const refreshTokenRateLimitMiddleware = async (req, res, next) => {
    try {
        await refreshTokenRateLimiter.consume(req.ip || "unknown");
        return next();
    }
    catch (error) {
        return handleRateLimiterRejection(error, res, next);
    }
};

module.exports = {
    loginRateLimitMiddleware,
    forgotPasswordRateLimitMiddleware,
    refreshTokenRateLimitMiddleware,
    resetPasswordRateLimitMiddleware,
};
