const verificationCodesRouter = require("express").Router();

const verificationCodesController = require("../../controllers/verification_codes");
const { verificationCodesValidator } = require("../../validators");
const { rateLimitsMiddlewares } = require("../../middlewares");

const {
    sendOtpRateLimitMiddleware,
    verifyOtpRateLimitMiddleware,
} = rateLimitsMiddlewares.otpRateLimitersMiddlewares;

verificationCodesRouter.post("/",
    sendOtpRateLimitMiddleware,
    verificationCodesValidator.send,
    verificationCodesController.postSendVerificationCode,
);

verificationCodesRouter.post("/verify",
    verifyOtpRateLimitMiddleware,
    verificationCodesValidator.verify,
    verificationCodesController.postVerify,
);

module.exports = verificationCodesRouter;
