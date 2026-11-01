const UPLOAD_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 mb

const { FILES_UPLOAD_PATH } = require("../paths");

const FILES_DIRECTORY_PATH = FILES_UPLOAD_PATH;

const FILE_UPLOAD_MAX_SIZE_IN_BYTES = 100 * 1024 * 1024;

const ALLOWED_FILE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

module.exports = {
    UPLOAD_MAX_FILE_SIZE,
    FILES_DIRECTORY_PATH,
    FILE_UPLOAD_MAX_SIZE_IN_BYTES,
    ALLOWED_FILE_MIME_TYPES,
    ALLOWED_IMAGE_MIME_TYPES,
};
