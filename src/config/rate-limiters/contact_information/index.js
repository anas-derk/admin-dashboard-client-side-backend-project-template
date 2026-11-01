const createRateLimiter = require("../create_rate_limiter");

const getContactInformationRateLimiter = createRateLimiter("contact_information_get", 90, 60);

module.exports = {
    getContactInformationRateLimiter,
};
