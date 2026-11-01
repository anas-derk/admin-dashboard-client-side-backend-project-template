const { config } = require("dotenv");
const { resolve } = require("path");

const { DEFAULT_SERVER_PORT } = require("../../constants/server");

const name = process.env.NODE_ENV || "development";

config({
    path: resolve(__dirname, `../../../.env.${name}`),
    quiet: true,
});

process.env.NODE_ENV = name;

function getRequiredString(variableName) {
    const value = process.env[variableName]?.trim();
    if (!value) throw new Error(`Missing required environment variable: ${variableName}`);
    return value;
}

function getOptionalString(variableName, fallback = "") {
    return process.env[variableName]?.trim() || fallback;
}

function getOptionalList(variableName) {
    return getOptionalString(variableName)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
}

function getInteger(variableName, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
    const rawValue = process.env[variableName];
    if (rawValue === undefined || rawValue === "") return fallback;

    const value = Number(rawValue);
    if (!Number.isInteger(value) || value < min || value > max) {
        throw new Error(`Environment variable ${variableName} must be an integer between ${min} and ${max}`);
    }
    return value;
}

const environment = Object.freeze({
    name,
    isProduction: name === "production",
    server: Object.freeze({
        port: getInteger("PORT", DEFAULT_SERVER_PORT, { min: 1, max: 65535 }),
        trustedProxies: Object.freeze(getOptionalList("TRUSTED_PROXIES")),
    }),
    databases: Object.freeze({
        clientUrl: getRequiredString("DB_URL"),
        dashboardUrl: getRequiredString("DASH_DB_URL"),
    }),
    security: Object.freeze({
        SECRET_KEY: getRequiredString("SECRET_KEY"),
    }),
    google: Object.freeze({
        clientId: getOptionalString("GOOGLE_CLIENT_ID"),
    }),
    redis: Object.freeze({
        host: getOptionalString("REDIS_HOST", "127.0.0.1"),
        port: getInteger("REDIS_PORT", 6379, { min: 1, max: 65535 }),
        db: getInteger("REDIS_DB", 0),
        username: getOptionalString("REDIS_USERNAME"),
        password: getOptionalString("REDIS_PASSWORD"),
        tls: process.env.REDIS_TLS === "true",
    }),
    smtp: Object.freeze({
        host: getOptionalString("SMTP_HOST", "smtp.sender.net"),
        port: getInteger("SMTP_PORT", 587, { min: 1, max: 65535 }),
        username: getOptionalString("SMTP_USERNAME"),
        password: getOptionalString("SMTP_PASSWORD"),
    }),
    urls: Object.freeze({
        website: getOptionalString("WEBSITE_URL"),
        baseApiImages: getOptionalString("BASE_API_IMAGES_URL"),
    }),
});

module.exports = environment;
