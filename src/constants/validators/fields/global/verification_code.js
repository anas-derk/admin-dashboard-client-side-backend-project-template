const { z } = require("zod");

const { CODE_LENGTH } = require("../../../verification_codes");

const verificationCode = z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${CODE_LENGTH}}$`), { message: "INVALID_VERIFICATION_CODE" });

module.exports = { verificationCode };
