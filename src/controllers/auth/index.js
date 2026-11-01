const { exceptionsHelpers, responsesHelpers } = require("../../helpers");
const { authService, authSessionsService } = require("../../services");
const {
    sendChangePasswordEmail,
    sendCongratulationsOnCreatingNewAccountEmail,
    sendVerificationCodeToUserEmail,
} = require("../../utils/emails");
const { signAccessToken } = require("../../utils/tokens");

const { throwIfError } = exceptionsHelpers;
const { getApiResponse } = responsesHelpers;

function withAuthenticationTokens(result, { refreshToken, sessionId }) {
    return getApiResponse(result, {
        ...result.data,
        accessToken: signAccessToken(result.data, sessionId),
        refreshToken,
    });
}

function sendAuthenticationResponse(res, status, result, tokens) {
    res.set("Cache-Control", "no-store");
    res.set("Pragma", "no-cache");
    return res.status(status).json(withAuthenticationTokens(result, tokens));
}

async function createAuthenticationTokens(result, req) {
    return authSessionsService.create(result.data._id, {
        ip: req.ip || "",
        userAgent: req.get("user-agent") || "",
    });
}

async function postLogin(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await authService.login(
            email.toLowerCase(),
            password,
            req.query.language,
            req.ip || "",
        );
        throwIfError(result);
        const tokens = await createAuthenticationTokens(result, req);
        return sendAuthenticationResponse(res, 200, result, tokens);
    }
    catch (error) {
        return next(error);
    }
}

async function postForgetPassword(req, res, next) {
    try {
        const { email } = req.body;
        const { language } = req.query;
        const result = await authService.forgetPassword(email, language);

        throwIfError(result);

        const { code, session, shouldSendEmail } = result.data;
        res.json(getApiResponse(result, { session }));

        try {
            if (!shouldSendEmail) return undefined;
            return await sendVerificationCodeToUserEmail(email, code, language);
        }
        catch (error) {
            console.error(error);
            return undefined;
        }
    }
    catch (error) {
        return next(error);
    }
}

async function postRefreshToken(req, res, next) {
    try {
        const result = await authSessionsService.rotate(req.body.refreshToken, req.query.language);
        throwIfError(result, 401);

        const { refreshToken, sessionId, ...userData } = result.data;
        result.data = userData;
        return sendAuthenticationResponse(res, 200, result, { refreshToken, sessionId });
    }
    catch (error) {
        return next(error);
    }
}

async function postLogout(req, res, next) {
    try {
        const result = await authSessionsService.revoke(
            req.data.sid,
            req.data._id,
            req.query.language,
        );
        throwIfError(result, 401);
        return res.status(200).json(getApiResponse(result));
    }
    catch (error) {
        return next(error);
    }
}

async function putResetPassword(req, res, next) {
    try {
        const { session, code, password } = req.body;
        const result = await authService.resetPassword(session, code, password, req.query.language);
        throwIfError(result);
        res.status(201).json(getApiResponse(result));

        try {
            await sendChangePasswordEmail(result.data.email, result.data.language);
        }
        catch (error) {
            console.error(error);
        }
    }
    catch (error) {
        return next(error);
    }
}

module.exports = {
    postForgetPassword,
    postLogin,
    postLogout,
    postRefreshToken,
    putResetPassword,
};
