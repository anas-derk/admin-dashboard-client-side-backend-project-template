const createRateLimitMiddleware = require("../create_rate_limit_middleware");

const {
    userInfoRateLimiter,
    updateUserInfoRateLimiter,
    updateUserImageRateLimiter,
    deleteUserRateLimiter,
} = require("../../../config/rate-limiters/users");

module.exports = {
    userInfoRateLimitMiddleware: createRateLimitMiddleware(userInfoRateLimiter, "users_user_info"),
    updateUserInfoRateLimitMiddleware: createRateLimitMiddleware(updateUserInfoRateLimiter, "users_update_info"),
    updateUserImageRateLimitMiddleware: createRateLimitMiddleware(updateUserImageRateLimiter, "users_update_image"),
    deleteUserRateLimitMiddleware: createRateLimitMiddleware(deleteUserRateLimiter, "users_delete"),
}
