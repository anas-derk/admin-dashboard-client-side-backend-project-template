const { RateLimiterRedis } = require("rate-limiter-flexible");

/* Line note: Initializes redis with require("../../../config/redis"). */
const redis = require("../../../config/redis");

/* Line note: Initializes global rate limiter with new RateLimiterRedis({. */
const globalRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "global",
    points: 120,
    duration: 60
});

module.exports = {
    globalRateLimiter,
};
