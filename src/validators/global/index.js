const { z } = require("zod");

const { languageFieldValidator } = require("../../constants/validators/fields/global");
const { validateRequest } = require("../validate");

function validateLanguage(req, res, next) {
    const schema = z.object({
        language: languageFieldValidator.language.optional(),
    }).passthrough();

    return validateRequest(schema, "query", req, res, next);
}

module.exports = { validateLanguage };
