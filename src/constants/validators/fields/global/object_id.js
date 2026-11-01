const { Types } = require("mongoose");
const { z } = require("zod");

const objectId = z
    .string()
    .trim()
    .refine((value) => Types.ObjectId.isValid(value), { message: "INVALID_OBJECT_ID" });

module.exports = { objectId };
