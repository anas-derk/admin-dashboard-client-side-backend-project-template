const { RateLimiterRedis } = require("rate-limiter-flexible");

const redis = require("../../redis");

/**
 * createRateLimiter
 *
 * Purpose: Creates or submits rate limiter through the server workflow.
 * Parameters: keyPrefix, points, duration, blockDuration = 0.
 * Algorithm:
 * 1. Returns the resulting record, response object, validation decision, or calculated value.
 * Returns: The resulting record, response, decision, or calculated value.
 */
function createRateLimiter(keyPrefix, points, duration, blockDuration = 0) {
    /* Line note: Returns new RateLimiterRedis({ storeClient: redis, keyPrefix, points, duration, ...(blockDuration ? { blockDuration } : {}), }) to the caller as the result of this server-side workflow. */
    return new RateLimiterRedis({
        storeClient: redis,
        keyPrefix,
        points,
        duration,
        ...(blockDuration ? { blockDuration } : {}),
    });
}

module.exports = createRateLimiter;