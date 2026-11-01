const authMiddlewares = require("./auth");
const filesMiddlewares = require("./files");
const globalMiddlewares = require("./global");
const rateLimitsMiddlewares = require("./rate-limiters");

module.exports = {
    authMiddlewares,
    filesMiddlewares,
    globalMiddlewares,
    rateLimitsMiddlewares,
};
