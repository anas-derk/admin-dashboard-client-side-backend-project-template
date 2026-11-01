const { z } = require("zod");

const {
    emailFieldValidator,
    googleCredentialFieldValidator,
    passwordFieldValidator,
    refreshTokenFieldValidator,
} = require("../../constants/validators/fields/auth");
const {
    languageFieldValidator,
    nameFieldValidator,
    objectIdFieldValidator,
    verificationCodeFieldValidator,
} = require("../../constants/validators/fields/global");
const { validateRequest } = require("../validate");

function createNewUser(req, res, next) {
    const schema = z.object({
        firstName: nameFieldValidator.name,
        lastName: nameFieldValidator.name,
        email: emailFieldValidator.email,
        password: passwordFieldValidator.password,
        language: languageFieldValidator.language,
    }).strict();

    return validateRequest(schema, "body", req, res, next);
}

function login(req, res, next) {
    const schema = z.object({
        email: emailFieldValidator.email,
        password: passwordFieldValidator.password,
    }).strict();

    return validateRequest(schema, "body", req, res, next);
}

function loginWithGoogle(req, res, next) {
    const schema = z.object({
        credential: googleCredentialFieldValidator.googleCredential,
    }).strict();

    return validateRequest(schema, "body", req, res, next);
}

function forgetPassword(req, res, next) {
    const schema = z.object({
        email: emailFieldValidator.email,
    }).strict();

    return validateRequest(schema, "body", req, res, next);
}

function resetPassword(req, res, next) {
    const schema = z.object({
        session: objectIdFieldValidator.objectId,
        code: verificationCodeFieldValidator.verificationCode,
        password: passwordFieldValidator.password,
    }).strict();

    return validateRequest(schema, "body", req, res, next);
}

function refreshToken(req, res, next) {
    const schema = z.object({
        refreshToken: refreshTokenFieldValidator.refreshToken,
    }).strict();

    return validateRequest(schema, "body", req, res, next);
}

module.exports = {
    createNewUser,
    forgetPassword,
    login,
    loginWithGoogle,
    refreshToken,
    resetPassword,
};
