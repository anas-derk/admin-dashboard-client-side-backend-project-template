const createRateLimiter = require("../create_rate_limiter");

const userInfoRateLimiter = createRateLimiter("users_user_info", 60, 60);
const updateUserInfoRateLimiter = createRateLimiter("users_update_info", 10, 600, 1800);
const updateUserImageRateLimiter = createRateLimiter("users_update_image", 10, 600, 1800);
const deleteUserRateLimiter = createRateLimiter("users_delete", 10, 600, 1800);

module.exports = {
    userInfoRateLimiter,
    updateUserInfoRateLimiter,
    updateUserImageRateLimiter,
    deleteUserRateLimiter,
};
