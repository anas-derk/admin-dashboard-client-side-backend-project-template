const { z } = require("zod");

const name = z
    .string()
    .trim()
    .min(1, { message: "NAME_REQUIRED" })
    .max(50, { message: "NAME_TOO_LONG" })
    .regex(/^[\p{L}\s]+$/u, { message: "INVALID_NAME" });

module.exports = { name };
