/**
 * getClientKey
 *
 * Purpose: Retrieves client key from the relevant data source.
 * Parameters: req.
 * Algorithm:
 * 1. Reads the validated request data required by the operation.
 * 2. Returns the resulting record, response object, validation decision, or calculated value.
 * Returns: The resulting record, response, decision, or calculated value.
 */
function getClientKey(req) {
    /* Line note: Returns req?.data?._id || req.body?.email || req.query?.email || req.ip to the caller as the result of this server-side workflow. */
    return req?.data?._id || req.body?.email || req.query?.email || req.ip;
}

/**
 * createRateLimitMiddleware
 *
 * Purpose: Creates or submits rate limit middleware through the server workflow.
 * Parameters: rateLimiter, keyScope, getCustomKey.
 * Algorithm:
 * 1. Sends the appropriate HTTP status and response payload to the client.
 * 2. Catches operational failures and converts or propagates them through the error-handling path.
 * Returns: The resulting record, response, decision, or calculated value.
 */
function createRateLimitMiddleware(rateLimiter, keyScope, getCustomKey) {
    /* Line note: Returns async (req, res, next) => { const key = `${keyScope}_${getCustomKey ? getCustomKey(req) : getClientKey(req)}`; try { await rateLimiter.consume... to the caller as the result of this server-side workflow. */
    return async (req, res, next) => {
        /* Line note: Stores key for reuse by the remaining server-side workflow. */
        const key = `${keyScope}_${getCustomKey ? getCustomKey(req) : getClientKey(req)}`;
        /* Line note: Attempts the database, network, file, email, or business workflow so failures can be handled by the catch block. */
        try {
            /* Line note: Waits for rateLimiter.consume(key) to complete before continuing. */
            await rateLimiter.consume(key);
            /* Line note: Delegates control to the next Express middleware after the current checks pass. */
            next();
        } catch (rejRes) {
            if (typeof rejRes?.msBeforeNext !== "number") return next(rejRes);
            const retryAfter = Math.max(1, Math.ceil(rejRes.msBeforeNext / 1000));
            res.set("Retry-After", String(retryAfter));
            /* Line note: Sets the HTTP status and sends the corresponding response payload to the client. */
            res.status(429).json({
                status: false,
                code: "TOO_MANY_REQUESTS",
                message: "Too many requests !!",
                data: {
                    retryAfter,
                }
            });
        }
    };
}

module.exports = createRateLimitMiddleware;
