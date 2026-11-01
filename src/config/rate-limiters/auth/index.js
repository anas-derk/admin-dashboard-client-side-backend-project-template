const { RateLimiterRedis } = require("rate-limiter-flexible");

/* Line note: Initializes redis with require("../../../config/redis"). */
const redis = require("../../../config/redis");

/* Line note: Initializes login rate limiter with new RateLimiterRedis({. */
const loginRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "login",
    points: 5,
    duration: 60,
    blockDuration: 300
});

/* Line note: Initializes forgot password rate limiter with new RateLimiterRedis({. */
const forgotPasswordRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "forgot_password",
    points: 3,
    duration: 300,
    blockDuration: 900
});

/* Line note: Initializes reset password rate limiter with new RateLimiterRedis({. */
const resetPasswordRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "reset_password",
    points: 5,
    duration: 300,
    blockDuration: 900
});

const refreshTokenRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "refresh_token",
    points: 10,
    duration: 60,
    blockDuration: 300,
});

module.exports = {
    loginRateLimiter,
    forgotPasswordRateLimiter,
    refreshTokenRateLimiter,
    resetPasswordRateLimiter,
};
