const emailFieldValidator = require("./email");
const googleCredentialFieldValidator = require("./google_credential");
const mobilePhoneFieldValidator = require("./mobile_phone");
const passwordFieldValidator = require("./password");
const refreshTokenFieldValidator = require("./refresh_token");

module.exports = {
    emailFieldValidator,
    googleCredentialFieldValidator,
    mobilePhoneFieldValidator,
    passwordFieldValidator,
    refreshTokenFieldValidator,
};
