const { getResponseObject } = require("../../helpers/responses");
const { getSuitableTranslations } = require("../../helpers/translation");

function validateRequest(schema, source, req, res, next) {
    const result = schema.safeParse(req[source] || {});

    if (!result.success) {
        return res.status(400).json(getResponseObject(
            getSuitableTranslations("Validation Error !!", req.query.language),
            true,
            result.error.flatten(),
            "VALIDATION_ERROR",
        ));
    }

    if (source === "body") {
        req.body = result.data;
    }

    return next();
}

module.exports = { validateRequest };
