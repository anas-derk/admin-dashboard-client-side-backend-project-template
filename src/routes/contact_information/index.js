const contactInformationRouter = require("express").Router();

const contactInformationController = require("../../controllers/contact_information");
const { rateLimitsMiddlewares } = require("../../middlewares");

const {
    getContactInformationRateLimitMiddleware,
} = rateLimitsMiddlewares.contactInformationLimitersMiddlewares;

contactInformationRouter.get("/",
    getContactInformationRateLimitMiddleware,
    contactInformationController.getContactInformation,
);

module.exports = contactInformationRouter;
