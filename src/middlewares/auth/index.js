const { getResponseObject } = require("../../helpers/responses");
const authSessionsService = require("../../services/auth_sessions");
const { verifyAccessToken } = require("../../utils/tokens");

async function validateJWT(req, res, next) {
    const authorization = req.headers.authorization;
    const match = typeof authorization === "string"
        ? authorization.trim().match(/^Bearer\s+(.+)$/i)
        : null;
    const token = match?.[1]?.trim();

    if (!token) {
        return res.status(401).json(getResponseObject(
            "Unauthorized Error",
            true,
            null,
            "UNAUTHORIZED",
        ));
    }

    try {
        const decodedToken = verifyAccessToken(token);
        if (
            decodedToken.tokenType !== "access"
            || decodedToken.isVerified !== true
            || !await authSessionsService.validate(decodedToken.sid, decodedToken._id)
        ) return unauthorized(res);
        req.data = decodedToken;
        return next();
    }
    catch (error) {
        if (["JsonWebTokenError", "NotBeforeError", "TokenExpiredError"].includes(error?.name)) {
            return unauthorized(res);
        }
        return next(error);
    }
}

function unauthorized(res) {
    return res.status(401).json(getResponseObject("Unauthorized Error", true, null, "UNAUTHORIZED"));
}

module.exports = { validateJWT };
