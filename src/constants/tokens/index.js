const { name: PROJECT_NAME } = require("../../../package.json");

const ACCESS_TOKEN_EXPIRE = "15m";
const REFRESH_TOKEN_EXPIRE_MS = 30 * 24 * 60 * 60 * 1000;
const TOKEN_AUDIENCE = PROJECT_NAME;
const TOKEN_ISSUER = `${PROJECT_NAME}-api`;

module.exports = {
    ACCESS_TOKEN_EXPIRE,
    REFRESH_TOKEN_EXPIRE_MS,
    TOKEN_AUDIENCE,
    TOKEN_ISSUER,
};
