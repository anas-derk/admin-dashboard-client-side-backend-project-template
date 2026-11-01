/* Line note: Initializes account codes translations with require("./index.json"). */
const accountCodesTranslations = require("./index.json");

module.exports = {
    ...accountCodesTranslations
}
