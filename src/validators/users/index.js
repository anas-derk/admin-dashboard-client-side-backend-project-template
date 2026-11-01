const { z } = require("zod");

const { emailFieldValidator, passwordFieldValidator } = require("../../constants/validators/fields/auth");
const {
    languageFieldValidator,
    nameFieldValidator,
} = require("../../constants/validators/fields/global");
const { validateRequest } = require("../validate");

function updateUserInfo(req, res, next) {
    const optionalName = nameFieldValidator.name.optional();
    const schema = z.object({
        firstName: optionalName,
        lastName: optionalName,
        email: emailFieldValidator.email.optional(),
        password: passwordFieldValidator.password.optional(),
        newPassword: passwordFieldValidator.password.optional(),
    }).strict().superRefine((data, context) => {
        if (data.password && !data.newPassword) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["newPassword"],
                message: "NEW_PASSWORD_REQUIRED",
            });
        }

        if (data.newPassword && !data.password) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["password"],
                message: "CURRENT_PASSWORD_REQUIRED",
            });
        }
    });

    return validateRequest(schema, "body", req, res, next);
}

function deleteUser(req, res, next) {
    const schema = z.object({
        language: languageFieldValidator.language.optional(),
    }).strict();

    return validateRequest(schema, "query", req, res, next);
}

module.exports = { deleteUser, updateUserInfo };
