const authRateLimitersMiddlewares = require("./auth");
const contactInformationLimitersMiddlewares = require("./contact_information");
const otpRateLimitersMiddlewares = require("./otp");
const usersRateLimitersMiddlewares = require("./users");

module.exports = {
    authRateLimitersMiddlewares,
    contactInformationLimitersMiddlewares,
    otpRateLimitersMiddlewares,
    usersRateLimitersMiddlewares,
};