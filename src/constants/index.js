const contactInformation = require("./contact_information");
const emails = require("./emails");
const files = require("./files");
const languages = require("./languages");
const paths = require("./paths");
const ratings = require("./ratings");
const server = require("./server");
const sort = require("./sort");
const tokens = require("./tokens");
const translation = require("./translation");
const users = require("./users");
const verification_codes = require("./verification_codes");
const website = require("./website");
const fieldsValidators = require("./validators/fields");

module.exports = {
    contactInformation,
    emails,
    files,
    languages,
    paths,
    ratings,
    server,
    sort,
    tokens,
    translation,
    users,
    verification_codes,
    website,
    fieldsValidators,
};
