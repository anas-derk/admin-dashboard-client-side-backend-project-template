const { contactInformationModel } = require("../../models");
const createRepository = require("../factory");

module.exports = createRepository(contactInformationModel);
