function getResponseObject(message, isError, data = null, code = isError ? "UNKNOWN_ERROR" : "OK") {
    const isEmptyObject = data
        && typeof data === "object"
        && !Array.isArray(data)
        && Object.keys(data).length === 0;

    return {
        status: !isError,
        code,
        message,
        data: isEmptyObject ? null : data,
    };
}

function getApiResponse(result, data = result.data) {
    return getResponseObject(
        result.msg,
        result.error,
        data,
        result.code || (result.error ? "UNKNOWN_ERROR" : "OK"),
    );
}

module.exports = {
    getApiResponse,
    getResponseObject,
};
