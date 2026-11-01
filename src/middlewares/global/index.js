const { globalRateLimiter } = require("../../config/rate-limiters/global");
const { getRequestIp } = require("../../utils/common");

function keyGeneratorForRequestsRateLimit(req) {
    return getRequestIp(req);
}

async function globalRateLimitMiddleware(req, res, next) {
    try {
        await globalRateLimiter.consume(keyGeneratorForRequestsRateLimit(req));
        return next();
    }
    catch (rejection) {
        if (typeof rejection?.msBeforeNext !== "number") return next(rejection);
        const retryAfter = Math.max(1, Math.ceil(rejection.msBeforeNext / 1000));
        res.set("Retry-After", String(retryAfter));
        return res.status(429).json({
            status: false,
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests !!",
            data: {
                retryAfter,
            },
        });
    }
}

module.exports = { globalRateLimitMiddleware };
