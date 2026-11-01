/* Line note: Initializes global translations with require("./index.json"). */
const globalTranslations = require("./index.json");

module.exports = {
    ...globalTranslations
}
