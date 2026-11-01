const { sign, verify } = require("jsonwebtoken");

const environment = require("../../config/environment");
const {
    ACCESS_TOKEN_EXPIRE,
    TOKEN_AUDIENCE,
    TOKEN_ISSUER,
} = require("../../constants/tokens");

function signAccessToken(userData, sessionId) {
    return sign({
        ...userData,
        sid: sessionId,
        tokenType: "access",
    }, environment.security.SECRET_KEY, {
        algorithm: "HS256",
        audience: TOKEN_AUDIENCE,
        expiresIn: ACCESS_TOKEN_EXPIRE,
        issuer: TOKEN_ISSUER,
    });
}

function verifyAccessToken(token) {
    return verify(token, environment.security.SECRET_KEY, {
        algorithms: ["HS256"],
        audience: TOKEN_AUDIENCE,
        issuer: TOKEN_ISSUER,
    });
}

module.exports = { signAccessToken, verifyAccessToken };
