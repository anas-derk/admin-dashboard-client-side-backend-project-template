const { z } = require("zod");

const password = z
    .string()
    .min(8, { message: "PASSWORD_TOO_SHORT" })
    .max(128, { message: "PASSWORD_TOO_LONG" })
    .refine((value) => /[a-z]/.test(value), { message: "PASSWORD_REQUIRES_LOWERCASE" })
    .refine((value) => /[A-Z]/.test(value), { message: "PASSWORD_REQUIRES_UPPERCASE" })
    .refine((value) => /\d/.test(value), { message: "PASSWORD_REQUIRES_NUMBER" });

module.exports = { password };
