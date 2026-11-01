const { compareSync, hashSync } = require("bcryptjs");
const CodeGenerator = require("node-code-generator");

const { CODE_EXPIRY_MINUTES, CODE_LENGTH } = require("../../constants/verification_codes");
const { getSuitableTranslations } = require("../../helpers/translation");
const {
    applyAttemptLock,
    checkExpiration,
    checkLock,
    checkResendCooldown,
    refreshAttemptWindow,
} = require("../../helpers/verification_codes");
const {
    sessionsRepository,
    usersRepository,
    verificationCodesRepository,
} = require("../../repositories");
const sessionsService = require("../sessions");

async function create(email, typeOfUse, language) {
    const sessionResult = await sessionsService.checkOrCreate(email, typeOfUse, language);
    const session = sessionResult.data;
    const generator = new CodeGenerator();
    const generatedCode = generator.generateCodes("#".repeat(CODE_LENGTH))[0];
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    let verificationCode = await verificationCodesRepository.retrieve({ session: session._id });

    if (!verificationCode) {
        const user = typeOfUse === "activate-account"
            ? await usersRepository.retrieve({ email })
            : null;
        verificationCode = await verificationCodesRepository.create({
            session: session._id,
            code: hashSync(generatedCode, 10),
            expiresAt,
            email,
            typeOfUse,
            ...(user?._id && { user: user._id }),
        });
    }
    else {
        const cooldownResult = checkResendCooldown(verificationCode.lastSentAt);
        if (cooldownResult.error) {
            cooldownResult.msg = getSuitableTranslations(cooldownResult.msg, language);
            return cooldownResult;
        }

        verificationCode = await verificationCodesRepository.update(verificationCode, {
            code: hashSync(generatedCode, 10),
            expiresAt,
            sentCount: verificationCode.sentCount + 1,
            lastSentAt: Date.now(),
        });
    }

    return {
        code: "VERIFICATION_CODE_CREATED",
        msg: getSuitableTranslations("Creating New Verification Code Process Has Been Successfully !!", language),
        error: false,
        data: {
            session: verificationCode.session,
            code: generatedCode,
            lastSentAt: verificationCode.lastSentAt,
            expiresAt: verificationCode.expiresAt,
            sentCount: verificationCode.sentCount,
            ...(verificationCode.user && { user: verificationCode.user }),
        },
    };
}

async function retrieve(sessionId, language) {
    const verificationCode = await verificationCodesRepository.retrieve(
        { session: sessionId },
        { projection: { __v: false } },
    );

    if (!verificationCode) {
        return {
            code: "VERIFICATION_CODE_NOT_FOUND",
            msg: getSuitableTranslations("Sorry, This Verification Code Is Not Exist !!", language),
            error: true,
            data: {},
        };
    }

    return {
        code: "VERIFICATION_CODE_RETRIEVED",
        msg: getSuitableTranslations("Get Verification Code Process Has Been Successfully !!", language),
        error: false,
        data: verificationCode,
    };
}

async function check(sessionId, code, id, language) {
    const sessionResult = await sessionsService.retrieve(sessionId, language);
    if (sessionResult.error) return sessionResult;

    const verificationCodeResult = await retrieve(sessionId, language);
    if (verificationCodeResult.error) {
        return {
            code: "VERIFICATION_CODE_NOT_FOUND",
            msg: getSuitableTranslations(
                "Sorry, This Verification Code For This {{id}} Is Not Exist !!",
                language,
                { id: id ?? "Email" },
            ),
            error: true,
            data: {},
        };
    }

    if (verificationCodeResult.data.typeOfUse !== sessionResult.data.typeOfUse) {
        return {
            code: "INVALID_VERIFICATION_CODE_TYPE",
            msg: getSuitableTranslations("Sorry, Type Of Use Verification Code Is Not Valid !!", language),
            error: true,
            data: {},
        };
    }

    if (!compareSync(code, verificationCodeResult.data.code)) {
        return {
            code: "INVALID_VERIFICATION_CODE",
            msg: getSuitableTranslations(
                "Sorry, This Code For This {{id}} Is Not Valid !!",
                language,
                { id: id ?? "Email" },
            ),
            error: true,
            data: verificationCodeResult.data,
        };
    }

    return {
        code: "VERIFICATION_CODE_VALID",
        msg: getSuitableTranslations("Checking Code Process Has Been Succesfully !!", language),
        error: false,
        data: verificationCodeResult.data,
    };
}

async function verify(sessionId, code, id, language) {
    const checkResult = await check(sessionId, code, id, language);

    if (!checkResult.error) {
        const lockResult = checkLock(checkResult.data.blockedUntil);
        if (lockResult.error) {
            lockResult.msg = getSuitableTranslations(lockResult.msg, language);
            return lockResult;
        }

        const expirationResult = checkExpiration(checkResult.data.expiresAt);
        if (expirationResult.error) {
            expirationResult.msg = getSuitableTranslations(expirationResult.msg, language);
            return expirationResult;
        }

        const verifiedAt = new Date();
        if (checkResult.data.typeOfUse === "activate-account") {
            const user = await usersRepository.update(
                { _id: checkResult.data.user },
                { isVerified: true },
            );
            if (!user) {
                return {
                    code: "USER_NOT_FOUND",
                    msg: getSuitableTranslations("Sorry, This User Is Not Exist !!", language),
                    error: true,
                    data: {},
                };
            }

            const responseData = checkResult.data._doc ?? checkResult.data;
            Object.assign(responseData, {
                verified: true,
                verifiedAt,
                user: user._id,
                userType: "user",
                isVerified: user.isVerified,
                provider: user.provider,
            });
            await sessionsRepository.delete({ _id: checkResult.data.session });
            await verificationCodesRepository.delete(checkResult.data);
        }
        else if (checkResult.data.typeOfUse === "reset-password") {
            await verificationCodesRepository.update(checkResult.data, { verified: true, verifiedAt });
        }
        else {
            Object.assign(checkResult.data._doc ?? checkResult.data, { verified: true, verifiedAt });
            await sessionsRepository.delete({ _id: checkResult.data.session });
            await verificationCodesRepository.delete(checkResult.data);
        }

        return {
            code: "VERIFICATION_CODE_VERIFIED",
            msg: getSuitableTranslations("Verify Code Process Has Been Succesfully !!", language),
            error: false,
            data: checkResult.data,
        };
    }

    if (checkResult.code === "INVALID_VERIFICATION_CODE") {
        const lockResult = checkLock(checkResult.data.blockedUntil);
        if (lockResult.error) {
            lockResult.msg = getSuitableTranslations(lockResult.msg, language);
            return lockResult;
        }

        const attemptWindow = refreshAttemptWindow(
            checkResult.data.attemptWindowStartedAt,
            checkResult.data.attemptsCount,
        );
        const updates = {
            attemptWindowStartedAt: attemptWindow.attemptWindowStartedAt,
            attemptsCount: attemptWindow.attemptsCount + 1,
            lastAttemptAt: attemptWindow.lastAttemptAt,
        };
        const attemptLock = applyAttemptLock(updates.attemptsCount);
        if (attemptLock) {
            Object.assign(updates, {
                lockLevel: attemptLock.lockLevel,
                blockedUntil: attemptLock.blockedUntil,
                attemptsCount: 0,
            });
        }
        await verificationCodesRepository.update(checkResult.data, updates);
        checkResult.data.code = code;
    }

    return checkResult;
}

async function checkIsVerified(sessionId, code, language) {
    const checkResult = await check(sessionId, code, undefined, language);
    if (checkResult.error) return checkResult;

    if (!checkResult.data.verified) {
        return {
            code: "VERIFICATION_CODE_NOT_VERIFIED",
            msg: getSuitableTranslations("Sorry, This Code Is Not Verified !!", language),
            error: true,
            data: {},
        };
    }

    return {
        code: "VERIFICATION_CODE_VERIFIED",
        msg: getSuitableTranslations("This Code Is Verified !!", language),
        error: false,
        data: checkResult.data,
    };
}

module.exports = {
    check,
    checkIsVerified,
    create,
    retrieve,
    verify,
};
