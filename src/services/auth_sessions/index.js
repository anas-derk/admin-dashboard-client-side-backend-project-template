const { createHash, randomBytes } = require("crypto");

const { REFRESH_TOKEN_EXPIRE_MS } = require("../../constants/tokens");
const { getSuitableTranslations } = require("../../helpers/translation");
const { authSessionsRepository, usersRepository } = require("../../repositories");

function generateRefreshToken() {
    return randomBytes(48).toString("base64url");
}

function hashRefreshToken(refreshToken) {
    return createHash("sha256").update(refreshToken).digest("hex");
}

async function create(userId, { ip = "", userAgent = "" } = {}) {
    const refreshToken = generateRefreshToken();
    const session = await authSessionsRepository.create({
        user: userId,
        refreshTokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_MS),
        ip,
        userAgent: userAgent.slice(0, 512),
    });

    return { refreshToken, sessionId: session._id };
}

async function rotate(refreshToken, language) {
    const currentRefreshTokenHash = hashRefreshToken(refreshToken);
    const nextRefreshToken = generateRefreshToken();
    const session = await authSessionsRepository.update({
        refreshTokenHash: currentRefreshTokenHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    }, {
        previousRefreshTokenHash: currentRefreshTokenHash,
        refreshTokenHash: hashRefreshToken(nextRefreshToken),
        lastUsedAt: new Date(),
    });

    if (!session) {
        await authSessionsRepository.update({
            previousRefreshTokenHash: currentRefreshTokenHash,
            revokedAt: null,
        }, { revokedAt: new Date() });
        return invalidSession(language);
    }

    const user = await usersRepository.retrieve(session.user);
    if (!user || !user.isVerified) {
        await authSessionsRepository.update(session, { revokedAt: new Date() });
        return invalidSession(language);
    }

    return {
        code: "TOKENS_REFRESHED",
        msg: getSuitableTranslations("Authentication Tokens Have Been Refreshed Successfully !!", language),
        error: false,
        data: {
            ...getUserTokenData(user),
            sessionId: session._id,
            refreshToken: nextRefreshToken,
        },
    };
}

async function validate(sessionId, userId) {
    if (!sessionId || !userId) return false;

    return Boolean(await authSessionsRepository.retrieve({
        _id: sessionId,
        user: userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    }));
}

async function revoke(sessionId, userId, language) {
    const session = await authSessionsRepository.update({
        _id: sessionId,
        user: userId,
        revokedAt: null,
    }, { revokedAt: new Date() });

    if (!session) return invalidSession(language);

    return {
        code: "LOGOUT_SUCCESS",
        msg: getSuitableTranslations("Logout Process Has Been Successfully !!", language),
        error: false,
        data: {},
    };
}

async function revokeAll(userId, databaseSession = null) {
    const { rows } = await authSessionsRepository.list({
        filters: { user: userId, revokedAt: null },
        session: databaseSession,
    });
    const revokedAt = new Date();
    if (databaseSession) {
        for (const session of rows) {
            await authSessionsRepository.update(session, { revokedAt }, { session: databaseSession });
        }
        return;
    }

    await Promise.all(rows.map((session) => authSessionsRepository.update(session, { revokedAt })));
}

function getUserTokenData(user) {
    return {
        _id: user._id,
        userType: "user",
        isVerified: user.isVerified,
        provider: user.provider,
        ...(user.email && { email: user.email }),
    };
}

function invalidSession(language) {
    return {
        code: "INVALID_AUTH_SESSION",
        msg: getSuitableTranslations("Sorry, Authentication Session Is Invalid Or Expired !!", language),
        error: true,
        status: 401,
        data: {},
    };
}

module.exports = {
    create,
    revoke,
    revokeAll,
    rotate,
    validate,
};
