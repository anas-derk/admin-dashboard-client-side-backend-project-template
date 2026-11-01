const { authSessionModel } = require("../../models");
const createRepository = require("../factory");

module.exports = createRepository(authSessionModel);
