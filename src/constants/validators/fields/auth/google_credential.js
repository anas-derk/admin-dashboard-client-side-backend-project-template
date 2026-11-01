const { z } = require("zod");

const googleCredential = z
    .string()
    .trim()
    .min(1, { message: "GOOGLE_CREDENTIAL_REQUIRED" })
    .max(8192, { message: "GOOGLE_CREDENTIAL_TOO_LONG" });

module.exports = { googleCredential };
