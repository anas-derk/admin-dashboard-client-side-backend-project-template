const authRouter = require("./auth");
const usersRouter = require("./users");
const verificationCodesRouter = require("./verification_codes");
const contactInformationRouter = require("./contact_information");

const { Router } = require("express");

const routes = Router();

routes.use("/auth", authRouter);

routes.use("/users", usersRouter);

routes.use("/otp", verificationCodesRouter);

routes.use("/contact", contactInformationRouter);

module.exports = routes;
