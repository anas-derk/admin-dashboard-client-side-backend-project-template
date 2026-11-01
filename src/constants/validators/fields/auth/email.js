const { z } = require("zod");

const email = z
    .string()
    .trim()
    .email({ message: "INVALID_EMAIL" })
    .max(254, { message: "EMAIL_TOO_LONG" });

module.exports = { email };
