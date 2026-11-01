const authRouter = require("express").Router();

const authController = require("../../controllers/auth");
const { authValidator } = require("../../validators");
const { authMiddlewares, rateLimitsMiddlewares } = require("../../middlewares");

const { validateJWT } = authMiddlewares;

const {
    loginRateLimitMiddleware,
    forgotPasswordRateLimitMiddleware,
    refreshTokenRateLimitMiddleware,
    resetPasswordRateLimitMiddleware,
} = rateLimitsMiddlewares.authRateLimitersMiddlewares;

authRouter.post("/login",
    loginRateLimitMiddleware,
    authValidator.login,
    authController.postLogin,
);

authRouter.post("/refresh",
    refreshTokenRateLimitMiddleware,
    authValidator.refreshToken,
    authController.postRefreshToken,
);

authRouter.post("/logout",
    validateJWT,
    authController.postLogout,
);

authRouter.post("/forgot-password",
    forgotPasswordRateLimitMiddleware,
    authValidator.forgetPassword,
    authController.postForgetPassword,
);

authRouter.put("/reset-password",
    resetPasswordRateLimitMiddleware,
    authValidator.resetPassword,
    authController.putResetPassword,
);

module.exports = authRouter;
