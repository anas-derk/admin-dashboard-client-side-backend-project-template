const authValidator = require("./auth");
const globalValidator = require("./global");
const usersValidator = require("./users");
const verificationCodesValidator = require("./verification_codes");

module.exports = {
    authValidator,
    globalValidator,
    usersValidator,
    verificationCodesValidator,
};
