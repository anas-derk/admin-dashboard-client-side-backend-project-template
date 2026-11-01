const { z } = require("zod");

const { emailFieldValidator } = require("../../constants/validators/fields/auth");
const {
    objectIdFieldValidator,
    verificationCodeFieldValidator,
    verificationCodeTypeFieldValidator,
} = require("../../constants/validators/fields/global");
const { validateRequest } = require("../validate");

function send(req, res, next) {
    const schema = z.object({
        email: emailFieldValidator.email,
        typeOfUse: verificationCodeTypeFieldValidator.verificationCodeType,
    }).strict();

    return validateRequest(schema, "body", req, res, next);
}

function verify(req, res, next) {
    const schema = z.object({
        code: verificationCodeFieldValidator.verificationCode,
        session: objectIdFieldValidator.objectId,
    }).strict();

    return validateRequest(schema, "body", req, res, next);
}

module.exports = { send, verify };
