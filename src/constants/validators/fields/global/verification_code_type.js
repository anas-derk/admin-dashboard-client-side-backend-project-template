const { z } = require("zod");

const { TYPES_OF_USE_VERIFICATION_CODE } = require("../../../verification_codes");

const verificationCodeType = z.enum(TYPES_OF_USE_VERIFICATION_CODE, {
    errorMap: () => ({ message: "INVALID_VERIFICATION_CODE_TYPE" }),
});

module.exports = { verificationCodeType };
