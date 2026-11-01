const { verificationCodeModel } = require("../../models");
const createRepository = require("../factory");

module.exports = createRepository(verificationCodeModel);
