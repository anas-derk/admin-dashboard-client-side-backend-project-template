const { RESEND_COOLDOWN_MS, ATTEMPT_WINDOW_MS, MAX_ATTEMPTS, LOCK_DURATIONS } = require("../../constants/verification_codes");

/**
 * checkResendCooldown
 *
 * Purpose: Determines whether resend cooldown satisfies the required server rules.
 * Parameters: lastSentAt.
 * Algorithm:
 * 1. Returns the resulting record, response object, validation decision, or calculated value.
 * Returns: The resulting record, response, decision, or calculated value.
 */
function checkResendCooldown(lastSentAt) {
    /* Line note: Checks whether !lastSentAt and executes the matching business, validation, or authorization branch. */
    if (!lastSentAt) {
        /* Line note: Returns the standardized successful result with its message and response data. */
        return {
            code: "RESEND_ALLOWED",
            msg: "Resend Allowed !!",
            error: false,
            data: {
                retryAfterSeconds: 0
            }
        }
    }
    /* Line note: Stores remainingMs for reuse by the remaining server-side workflow. */
    const remainingMs =
        RESEND_COOLDOWN_MS - (Date.now() - lastSentAt.getTime());
    /* Line note: Checks whether remainingMs > 0 and executes the matching business, validation, or authorization branch. */
    if (remainingMs > 0) {
        /* Line note: Returns the standardized failed result with its explanatory message and no successful data. */
        return {
            code: "RESEND_TOO_SOON",
            msg: "Sorry, Please Wait Before Resending !!",
            error: true,
            data: {
                retryAfterSeconds: Math.ceil(remainingMs / 1000)
            }
        }
    }
    /* Line note: Returns the standardized successful result with its message and response data. */
    return {
        code: "RESEND_ALLOWED",
        msg: "Resend Allowed !!",
        error: false,
        data: {}
    }
}

/**
 * refreshAttemptWindow
 *
 * Purpose: Executes the refresh attempt window server-side workflow.
 * Parameters: attemptWindowStartedAt, attemptsCount.
 * Algorithm:
 * 1. Returns the resulting record, response object, validation decision, or calculated value.
 * Returns: The resulting record, response, decision, or calculated value.
 */
function refreshAttemptWindow(attemptWindowStartedAt, attemptsCount) {
    /* Line note: Checks whether !attemptWindowStartedAt and executes the matching business, validation, or authorization branch. */
    if (!attemptWindowStartedAt) {
        /* Line note: Assigns attemptWindowStartedAt the newly calculated or validated value. */
        attemptWindowStartedAt = new Date();
    }
    /* Line note: Stores now for reuse by the remaining server-side workflow. */
    const now = Date.now();
    /* Line note: Checks whether now - attemptWindowStartedAt.getTime() > ATTEMPT_WINDOW_MS and executes the matching business, validation, or authorization branch. */
    if (now - attemptWindowStartedAt.getTime() > ATTEMPT_WINDOW_MS) {
        /* Line note: Assigns attemptsCount the newly calculated or validated value. */
        attemptsCount = 0;
        /* Line note: Assigns attemptWindowStartedAt the newly calculated or validated value. */
        attemptWindowStartedAt = new Date();
    }
    /* Line note: Stores lastAttemptAt for reuse by the remaining server-side workflow. */
    const lastAttemptAt = new Date();
    /* Line note: Returns { attemptWindowStartedAt, attemptsCount, lastAttemptAt } to the caller as the result of this server-side workflow. */
    return {
        attemptWindowStartedAt,
        attemptsCount,
        lastAttemptAt
    }
}

/**
 * applyAttemptLock
 *
 * Purpose: Executes the apply attempt lock server-side workflow.
 * Parameters: attemptsCount.
 * Algorithm:
 * 1. Returns the resulting record, response object, validation decision, or calculated value.
 * Returns: The resulting record, response, decision, or calculated value.
 */
function applyAttemptLock(attemptsCount) {
    /* Line note: Checks whether attemptsCount >= MAX_ATTEMPTS and executes the matching business, validation, or authorization branch. */
    if (attemptsCount >= MAX_ATTEMPTS) {
        /* Line note: Stores violationCount for reuse by the remaining server-side workflow. */
        const violationCount = Math.floor(
            attemptsCount / MAX_ATTEMPTS
        );
        /* Line note: Stores lockLevelIndex for reuse by the remaining server-side workflow. */
        const lockLevelIndex = Math.min(
            violationCount - 1,
            LOCK_DURATIONS.length - 1
        );
        /* Line note: Stores lockHours for reuse by the remaining server-side workflow. */
        const lockHours = LOCK_DURATIONS[lockLevelIndex];
        /* Line note: Stores blockedUntil for reuse by the remaining server-side workflow. */
        const blockedUntil = new Date(
            Date.now() + lockHours * 60 * 60 * 1000
        );
        /* Line note: Returns { lockLevel: lockLevelIndex + 1, blockedUntil, } to the caller as the result of this server-side workflow. */
        return {
            lockLevel: lockLevelIndex + 1,
            blockedUntil,
        };
    }
    /* Line note: Returns null to the caller as the result of this server-side workflow. */
    return null;
}

/**
 * checkExpiration
 *
 * Purpose: Determines whether expiration satisfies the required server rules.
 * Parameters: expiresAt.
 * Algorithm:
 * 1. Returns the resulting record, response object, validation decision, or calculated value.
 * Returns: The resulting record, response, decision, or calculated value.
 */
function checkExpiration(expiresAt) {
    /* Line note: Checks whether expiresAt && expiresAt < Date.now() and executes the matching business, validation, or authorization branch. */
    if (expiresAt && expiresAt < Date.now()) {
        /* Line note: Returns the standardized failed result with its explanatory message and no successful data. */
        return {
            code: "VERIFICATION_CODE_EXPIRED",
            msg: "Sorry, Verification Code Expired !!",
            error: true,
            data: {}
        }
    }
    /* Line note: Returns the standardized successful result with its message and response data. */
    return {
        code: "VERIFICATION_CODE_VALID",
        msg: "Code is Valid !!",
        error: false,
        data: {}
    }
}

/**
 * checkLock
 *
 * Purpose: Determines whether lock satisfies the required server rules.
 * Parameters: blockedUntil.
 * Algorithm:
 * 1. Returns the resulting record, response object, validation decision, or calculated value.
 * Returns: The resulting record, response, decision, or calculated value.
 */
function checkLock(blockedUntil) {
    /* Line note: Checks whether blockedUntil && blockedUntil > Date.now() and executes the matching business, validation, or authorization branch. */
    if (blockedUntil && blockedUntil > Date.now()) {
        /* Line note: Stores remainingMs for reuse by the remaining server-side workflow. */
        const remainingMs = blockedUntil - Date.now();
        /* Line note: Returns the standardized failed result with its explanatory message and no successful data. */
        return {
            code: "TOO_MANY_ATTEMPTS",
            msg: "Sorry, Too Many Attempts, Please Try Again Later !!",
            error: true,
            data: {
                retryAfterSeconds: Math.ceil(remainingMs / 1000)
            }
        };
    }

    /* Line note: Returns the standardized successful result with its message and response data. */
    return {
        code: "NOT_LOCKED",
        msg: "Not locked !!",
        error: false,
        data: {}
    };
}

module.exports = {
    checkResendCooldown,
    refreshAttemptWindow,
    applyAttemptLock,
    checkExpiration,
    checkLock
}
