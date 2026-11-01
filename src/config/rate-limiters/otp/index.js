const createRateLimiter = require("../create_rate_limiter");

/* Line note: Initializes send otp rate limiter with new RateLimiterRedis({. */
const sendOtpRateLimiter = createRateLimiter("otp_send", 3, 60);

const verifyOtpIpRateLimiter = createRateLimiter("otp_verify_ip", 15, 300, 900);
const verifyOtpSessionRateLimiter = createRateLimiter("otp_verify_session", 5, 300, 900);

module.exports = {
    sendOtpRateLimiter,
    verifyOtpIpRateLimiter,
    verifyOtpSessionRateLimiter,
};
