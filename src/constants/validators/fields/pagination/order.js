const { z } = require("zod");

const { SORT_TYPES } = require("../../../sort");

const order = z.enum(SORT_TYPES, {
    errorMap: () => ({ message: "INVALID_SORT_TYPE" }),
});

module.exports = { order };
