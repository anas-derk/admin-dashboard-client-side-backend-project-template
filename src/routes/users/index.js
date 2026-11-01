const usersRouter = require("express").Router();

const usersController = require("../../controllers/users");
const { usersValidator } = require("../../validators");
const { authMiddlewares, filesMiddlewares, rateLimitsMiddlewares } = require("../../middlewares");

const { validateJWT } = authMiddlewares;
const {
    setImageValidationOptions,
    uploadUserImage,
    validateIsExistErrorInFiles,
    validateRealFilesType,
} = filesMiddlewares;
const {
    userInfoRateLimitMiddleware,
    updateUserInfoRateLimitMiddleware,
    updateUserImageRateLimitMiddleware,
    deleteUserRateLimitMiddleware,
} = rateLimitsMiddlewares.usersRateLimitersMiddlewares;

usersRouter.get("/",
    validateJWT,
    userInfoRateLimitMiddleware,
    usersController.getUserInfo,
);

usersRouter.put("/",
    validateJWT,
    updateUserInfoRateLimitMiddleware,
    usersValidator.updateUserInfo,
    usersController.putUserInfo,
);

usersRouter.put("/image",
    validateJWT,
    updateUserImageRateLimitMiddleware,
    uploadUserImage,
    validateIsExistErrorInFiles,
    setImageValidationOptions,
    validateRealFilesType,
    usersController.putUserImage,
);

usersRouter.delete("/",
    validateJWT,
    deleteUserRateLimitMiddleware,
    usersValidator.deleteUser,
    usersController.deleteUser,
);

module.exports = usersRouter;
