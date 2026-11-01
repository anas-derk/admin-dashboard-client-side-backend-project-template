const { compare, hash, hashSync } = require("bcryptjs");

const { clientDB } = require("../../database/connections");
const { getSuitableTranslations } = require("../../helpers/translation");
const {
    sessionsRepository,
    usersRepository,
    verificationCodesRepository,
} = require("../../repositories");
const loginLogsService = require("../login_logs");
const authSessionsService = require("../auth_sessions");
const verificationCodesService = require("../verification_codes");

const DUMMY_PASSWORD_HASH = hashSync("ThisPasswordIsNeverUsed1", 10);

async function login(email, password, language, ip = "") {
    const user = await usersRepository.retrieve({ email }, { projection: "+password" });
    const passwordHash = user?.provider === "same-site" && user.password
        ? user.password
        : DUMMY_PASSWORD_HASH;
    const passwordMatches = await compare(password, passwordHash);

    if (
        !user
        || user.provider !== "same-site"
        || !user.password
        || !passwordMatches
    ) {
        return {
            code: "INVALID_CREDENTIALS",
            msg: getSuitableTranslations("Sorry, Email Or Password Incorrect !!", language),
            error: true,
            data: {},
        };
    }

    if (!user.isVerified) {
        return {
            code: "ACCOUNT_NOT_VERIFIED",
            msg: getSuitableTranslations("Sorry, This Account Is Not Verified !!", language),
            error: true,
            status: 403,
            data: {},
        };
    }

    await loginLogsService.create({ userId: user._id, email, ip });

    return loginResult(user, "Logining Process Has Been Successfully !!", "LOGIN_SUCCESS", language);
}

function loginResult(user, message, code, language) {
    return {
        code,
        msg: getSuitableTranslations(message, language),
        error: false,
        data: {
            _id: user._id,
            userType: "user",
            isVerified: user.isVerified,
            provider: user.provider,
            ...(user.email && { email: user.email }),
        },
    };
}

async function forgetPassword(email, language) {
    const [user, result] = await Promise.all([
        usersRepository.retrieve({ email }),
        verificationCodesService.create(email, "reset-password", language),
    ]);
    if (result.error) return result;

    return {
        code: "PASSWORD_RESET_REQUEST_ACCEPTED",
        msg: getSuitableTranslations(
            "If An Account Matches This Email, A Password Reset Code Will Be Sent !!",
            language,
        ),
        error: false,
        data: {
            ...result.data,
            shouldSendEmail: user?.provider === "same-site",
        },
    };
}

async function resetPassword(sessionId, code, newPassword, language) {
    const verificationResult = await verificationCodesService.checkIsVerified(sessionId, code, language);
    if (verificationResult.error) return verificationResult;

    const password = await hash(newPassword, 10);
    const databaseSession = await clientDB.startSession();
    let user;

    try {
        await databaseSession.withTransaction(async () => {
            user = await usersRepository.retrieve(
                { email: verificationResult.data.email },
                { session: databaseSession },
            );
            if (!user) throw createResetPasswordError("USER_NOT_FOUND");

            const consumedCode = await verificationCodesRepository.delete({
                _id: verificationResult.data._id,
                verified: true,
            }, { session: databaseSession });
            if (!consumedCode) throw createResetPasswordError("VERIFICATION_CODE_ALREADY_USED");

            await usersRepository.update(user, { password }, { session: databaseSession });
            await authSessionsService.revokeAll(user._id, databaseSession);
            await sessionsRepository.delete({ _id: sessionId }, { session: databaseSession });
        });
    }
    catch (error) {
        if (error.code === "USER_NOT_FOUND") return userNotFound(language);
        if (error.code === "VERIFICATION_CODE_ALREADY_USED") {
            return {
                code: error.code,
                msg: getSuitableTranslations("Sorry, This Code Is Not Verified !!", language),
                error: true,
                status: 409,
                data: {},
            };
        }
        throw error;
    }
    finally {
        await databaseSession.endSession();
    }

    return {
        code: "PASSWORD_RESET_SUCCESS",
        msg: getSuitableTranslations("Reseting Password Process Has Been Successfully !!", language),
        error: false,
        data: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            language: user.language,
            updatedAt: user.updatedAt,
        },
    };
}

function createResetPasswordError(code) {
    const error = new Error(code);
    error.code = code;
    return error;
}

function userNotFound(language) {
    return {
        code: "USER_NOT_FOUND",
        msg: getSuitableTranslations("Sorry, This User Is Not Exist !!", language),
        error: true,
        data: {},
    };
}

module.exports = { login, forgetPassword, resetPassword };
