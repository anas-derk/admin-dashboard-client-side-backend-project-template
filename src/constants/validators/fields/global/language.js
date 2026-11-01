const { z } = require("zod");

const { LANGUAGES } = require("../../../languages");

const language = z.enum(LANGUAGES, {
    errorMap: () => ({ message: "INVALID_LANGUAGE" }),
});

module.exports = { language };
