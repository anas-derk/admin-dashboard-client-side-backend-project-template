const { exceptionsHelpers, responsesHelpers } = require("../../helpers");
const { authSessionsService, verificationCodesService } = require("../../services");
const { sendVerificationCodeToUserEmail } = require("../../utils/emails");
const { signAccessToken } = require("../../utils/tokens");

const { throwIfError } = exceptionsHelpers;
const { getApiResponse } = responsesHelpers;

async function postSendVerificationCode(req, res, next) {
    try {
        const { email, typeOfUse } = req.body;
        const { language } = req.query;
        const result = await verificationCodesService.create(email, typeOfUse, language);

        throwIfError(result);

        const code = result.data.code;
        delete result.data.code;
        res.status(201).json(getApiResponse(result));

        if (email) {
            try {
                return await sendVerificationCodeToUserEmail(email, code, language);
            }
            catch (error) {
                console.error(error);
            }
        }
        return undefined;
    }
    catch (error) {
        return next(error);
    }
}

async function postVerify(req, res, next) {
    try {
        const { session, code } = req.body;
        const result = await verificationCodesService.verify(session, code, undefined, req.query.language);

        throwIfError(result);
        const data = result.data._doc ?? result.data;
        delete data.code;

        if (data.typeOfUse === "activate-account") {
            const userData = {
                _id: data.user,
                userType: data.userType,
                isVerified: data.isVerified,
                provider: data.provider,
            };
            const { refreshToken, sessionId } = await authSessionsService.create(data.user, {
                ip: req.ip || "",
                userAgent: req.get("user-agent") || "",
            });
            res.set("Cache-Control", "no-store");
            res.set("Pragma", "no-cache");
            return res.status(200).json(getApiResponse(result, {
                    ...data,
                    accessToken: signAccessToken(userData, sessionId),
                    refreshToken,
            }));
        }

        return res.status(200).json(getApiResponse(result));
    }
    catch (error) {
        return next(error);
    }
}

module.exports = { postSendVerificationCode, postVerify };
