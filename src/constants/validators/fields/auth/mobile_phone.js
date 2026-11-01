const { z } = require("zod");

const mobilePhone = z.string().trim().min(7, { message: "PHONE_NUMBER_TOO_SHORT" }).max(25, { message: "PHONE_NUMBER_TOO_LONG" });

module.exports = { mobilePhone };
