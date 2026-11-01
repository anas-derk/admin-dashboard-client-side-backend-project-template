const { z } = require("zod");

const whatsappNumber = z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{7,25}$/, { message: "INVALID_WHATSAPP_NUMBER" });

module.exports = { whatsappNumber };
