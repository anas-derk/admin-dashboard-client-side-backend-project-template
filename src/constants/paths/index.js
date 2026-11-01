const { join } = require("path");

const PUBLIC_PATH = join(__dirname, "..", "..", "..", "public");
const UPLOAD_PATH = join(PUBLIC_PATH, "uploads");
const FILES_UPLOAD_PATH = join(UPLOAD_PATH, "files");
const USER_IMAGES_UPLOAD_PATH = join(UPLOAD_PATH, "users");

module.exports = {
    FILES_UPLOAD_PATH,
    PUBLIC_PATH,
    UPLOAD_PATH,
    USER_IMAGES_UPLOAD_PATH,
};
