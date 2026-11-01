const { z } = require("zod");

function isHttpUrl(value) {
    try {
        return ["http:", "https:"].includes(new URL(value).protocol);
    }
    catch (_) {
        return false;
    }
}

const httpUrl = z
    .string()
    .trim()
    .url({ message: "INVALID_URL" })
    .refine(isHttpUrl, { message: "INVALID_URL_PROTOCOL" });

module.exports = { httpUrl };
