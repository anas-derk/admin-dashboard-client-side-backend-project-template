const { z } = require("zod");

const { SORT_METHODS } = require("../../../sort");

const sort = z.enum(SORT_METHODS, {
    errorMap: () => ({ message: "INVALID_SORT_METHOD" }),
});

module.exports = { sort };
