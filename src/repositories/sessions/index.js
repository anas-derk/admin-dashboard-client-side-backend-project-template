const { sessionModel } = require("../../models");
const createRepository = require("../factory");

module.exports = createRepository(sessionModel);
