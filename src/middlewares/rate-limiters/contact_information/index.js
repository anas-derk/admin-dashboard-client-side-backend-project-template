const createRateLimitMiddleware = require("../create_rate_limit_middleware");
const { getContactInformationRateLimiter } = require("../../../config/rate-limiters/contact_information");

module.exports = {
    getContactInformationRateLimitMiddleware: createRateLimitMiddleware(getContactInformationRateLimiter, "contact_information_get"),
};
