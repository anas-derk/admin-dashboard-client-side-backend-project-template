const { userModel } = require("../../models");
const createRepository = require("../factory");

module.exports = createRepository(userModel);
