const { globalPasswordModel } = require("../../models");
const createRepository = require("../factory");

module.exports = createRepository(globalPasswordModel);
