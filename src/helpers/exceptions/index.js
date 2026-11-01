const { getResponseObject } = require("../responses");
const environment = require("../../config/environment");

class ApiException extends Error {
    constructor(code, message, status = 400, data = null, options = {}) {
        super(message || code, options);
        this.name = "ApiException";
        this.code = code || "UNKNOWN_ERROR";
        this.status = status;
        this.data = data;
        this.isOperational = true;
    }
}

function createExceptionFromResult(result, status = 400) {
    return new ApiException(
        result?.code || "UNKNOWN_ERROR",
        result?.msg || "UNKNOWN_ERROR",
        result?.status || status,
        result?.data || null,
    );
}

function throwIfError(result, status = 400) {
    if (result?.error) throw createExceptionFromResult(result, status);
    return result;
}

function handlingExceptionsInController(res, error, customErrors = [], data = null) {
    const isCustomError = customErrors.includes(error?.code)
        || customErrors.includes(error?.message);
    const normalizedError = isCustomError && !(error instanceof ApiException)
        ? new ApiException(error.code || error.message, error.message, error.status || 400, data)
        : error;

    return sendExceptionResponse(res, normalizedError);
}

function exceptions(error, req, res, next) {
    if (res.headersSent) return next(error);
    return sendExceptionResponse(res, error, req);
}

function sendExceptionResponse(res, error, req = null) {
    const isOperational = error instanceof ApiException || error?.isOperational === true;
    const status = isOperational ? normalizeStatus(error.status) : 500;
    const code = isOperational ? (error.code || "UNKNOWN_ERROR") : "INTERNAL_SERVER_ERROR";
    const message = isOperational ? (error.message || code) : "INTERNAL_SERVER_ERROR";
    const data = isOperational ? (error.data ?? null) : null;

    if (!isOperational || !environment.isProduction) {
        const requestLabel = req ? `${req.method} ${req.originalUrl || req.url}` : "Controller";
        console.error(`[${requestLabel}]`, error);
    }

    return res.status(status).json(getResponseObject(message, true, data, code));
}

function normalizeStatus(status) {
    return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
}

module.exports = {
    ApiException,
    createExceptionFromResult,
    exceptions,
    handlingExceptionsInController,
    throwIfError,
};
