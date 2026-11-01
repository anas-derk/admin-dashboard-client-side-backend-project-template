/**
 * Function documentation: getDateFormated
 * Purpose: Retrieves date formated from the relevant data source.
 * Parameters: date.
 * Algorithm:
 * 1. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
function getDateFormated(date) {
    /* Line note: Initializes ordered date in date format with new Date(date). */
    let orderedDateInDateFormat = new Date(date);
    /* Line note: Initializes year with orderedDateInDateFormat.getFullYear(). */
    const year = orderedDateInDateFormat.getFullYear();
    /* Line note: Initializes month with orderedDateInDateFormat.getMonth() + 1. */
    const month = orderedDateInDateFormat.getMonth() + 1;
    /* Line note: Initializes day with orderedDateInDateFormat.getDate(). */
    const day = orderedDateInDateFormat.getDate();
    orderedDateInDateFormat = `${year} / ${month} / ${day}`;
    /* Line note: Returns the prepared ordered date in date format result to the caller. */
    return orderedDateInDateFormat;
}

/**
 * Function documentation: getRequestIp
 * Purpose: Retrieves request ip from the relevant data source.
 * Parameters: req.
 * Algorithm:
 * 1. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
function getRequestIp(req) {
    return req.ip || req.socket?.remoteAddress || "unknown";
}

module.exports = {
    getDateFormated,
    getRequestIp,
};
