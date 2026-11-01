/* Line note: Initializes common translations with require("./common"). */
const commonTranslations = require("./common");
/* Line note: Initializes global translations with require("./global"). */
const globalTranslations = require("./global");
/* Line note: Initializes sections translations with require("./sections"). */
const sectionsTranslations = require("./sections");

module.exports = {
    ...commonTranslations,
    ...globalTranslations,
    ...sectionsTranslations,
}
