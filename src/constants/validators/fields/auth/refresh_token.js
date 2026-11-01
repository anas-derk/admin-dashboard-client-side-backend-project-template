const { z } = require("zod");

const refreshToken = z
    .string()
    .trim()
    .min(64, { message: "INVALID_REFRESH_TOKEN" })
    .max(128, { message: "INVALID_REFRESH_TOKEN" })
    .regex(/^[A-Za-z0-9_-]+$/, { message: "INVALID_REFRESH_TOKEN" });

module.exports = { refreshToken };
