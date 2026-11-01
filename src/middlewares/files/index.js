const { getResponseObject } = require("../../helpers/responses");
const { getSuitableTranslations } = require("../../helpers/translation");

const { unlinkSync } = require("fs");

const multer = require("multer");

const {
    UPLOAD_MAX_FILE_SIZE,
    FILE_UPLOAD_MAX_SIZE_IN_BYTES,
    ALLOWED_FILE_MIME_TYPES,
    ALLOWED_IMAGE_MIME_TYPES,
} = require("../../constants/files");

function createRequiredImageUpload(fieldName, noFileError, invalidMimeTypeError) {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: UPLOAD_MAX_FILE_SIZE,
        },
        fileFilter: (req, file, callback) => {
            if (!file) {
                req.uploadError = noFileError;
                return callback(null, false);
            }
            if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
                req.uploadError = invalidMimeTypeError;
                return callback(null, false);
            }
            callback(null, true);
        },
    }).single(fieldName);

    return (req, res, next) => upload(req, res, (error) => {
        if (!error) return next();
        if (!(error instanceof multer.MulterError)) return next(error);

        req.uploadError = error.code === "LIMIT_FILE_SIZE"
            ? "Sorry, User Image Must Not Exceed 5 MB !!"
            : "Sorry, User Image Could Not Be Uploaded !!";
        return next();
    });
}

const uploadUserImage = createRequiredImageUpload(
    "userImage",
    "Sorry, No Files Uploaded, Please Upload The Files",
    "Sorry, Invalid File Mimetype, Only JPEG, PNG And Webp files are allowed !!"
);

function fileFilter(req, file, callback) {
    if (!file) {
        req.uploadError = "Sorry, No File Uploaded, Please Upload The File";
        return callback(null, false);
    }
    if (!ALLOWED_FILE_MIME_TYPES.includes(file.mimetype)) {
        req.uploadError = "Sorry, Invalid File Mimetype !!";
        return callback(null, false);
    }
    callback(null, true);
}

const uploadRequiredFile = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: FILE_UPLOAD_MAX_SIZE_IN_BYTES,
    },
    fileFilter,
}).single("file");

const uploadOptionalFile = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: FILE_UPLOAD_MAX_SIZE_IN_BYTES,
    },
    fileFilter: (req, file, callback) => {
        if (file && !ALLOWED_FILE_MIME_TYPES.includes(file.mimetype)) {
            req.uploadError = "Sorry, Invalid File Mimetype !!";
            return callback(null, false);
        }
        callback(null, true);
    },
}).single("file");

let fileTypeModulePromise;

function getFileTypeModule() {
    if (!fileTypeModulePromise) fileTypeModulePromise = import("file-type");
    return fileTypeModulePromise;
}

function setImageValidationOptions(req, res, next) {
    req.storageType = "memory";
    req.allowedMimeTypes = ALLOWED_IMAGE_MIME_TYPES;
    next();
}


/**
 * validateIsExistErrorInFiles
 *
 * Purpose: Determines whether is exist error in files satisfies the required server rules.
 * Parameters: req, res, next.
 * Algorithm:
 * 1. Reads the validated request data required by the operation.
 * 2. Selects localized content or response messages using the requested language.
 * 3. Sends the appropriate HTTP status and response payload to the client.
 * Returns: No application value; sends the HTTP response or delegates failure handling.
 */
function validateIsExistErrorInFiles(req, res, next) {
    /* Line note: Stores uploadError for reuse by the remaining server-side workflow. */
    const uploadError = req.uploadError;
    /* Line note: Checks whether uploadError and executes the matching business, validation, or authorization branch. */
    if (uploadError) {
        /* Line note: Sets the HTTP status and sends the corresponding response payload to the client. */
        res.status(400).json(getResponseObject(
            getSuitableTranslations(uploadError, req.query.language),
            true,
            null,
            "FILE_UPLOAD_ERROR",
        ));
        /* Line note: Returns immediately because the response or required side effect has already been completed. */
        return;
    }
    /* Line note: Delegates control to the next Express middleware after the current checks pass. */
    next();
}

function parseFileNameField(req, res, next) {
    if (!req.body.name || typeof req.body.name === "object") {
        return next();
    }
    try {
        req.body.name = JSON.parse(req.body.name);
    }
    catch (_) {
        req.body.name = {};
    }
    next();
}

function validateFileTypeValue(req, res, next) {
    const allowedFileTypes = ["PDF", "VIDEO", "Images", "ZIP", "Audios"];
    if (!allowedFileTypes.includes(req.body.type)) {
        return res.status(400).json(getResponseObject(
            getSuitableTranslations("Sorry, Invalid File Type !!", req.query.language),
            true,
            null,
            "INVALID_FILE_TYPE",
        ));
    }
    next();
}

function validateUploadedFileMatchesSelectedType(req, res, next) {
    if (!req.file) {
        return next();
    }
    const { type } = req.body;
    const mimeType = req.file?.mimetype;
    const isSuitable =
        (type === "PDF" && mimeType === "application/pdf") ||
        (type === "VIDEO" && mimeType?.startsWith("video/")) ||
        (type === "Images" && mimeType?.startsWith("image/")) ||
        (type === "ZIP" && ["application/zip", "application/x-zip-compressed", "multipart/x-zip"].includes(mimeType)) ||
        (type === "Audios" && mimeType?.startsWith("audio/"));
    if (!isSuitable) {
        return res.status(400).json(getResponseObject(
            getSuitableTranslations("Sorry, Uploaded File Does Not Match Selected File Type !!", req.query.language),
            true,
            null,
            "FILE_TYPE_MISMATCH",
        ));
    }
    next();
}

/**
 * validateRealFilesType
 *
 * Purpose: Determines whether real files type satisfies the required server rules.
 * Parameters: req, res, next.
 * Algorithm:
 * 1. Reads the validated request data required by the operation.
 * 2. Selects localized content or response messages using the requested language.
 * 3. Sends the appropriate HTTP status and response payload to the client.
 * 4. Catches operational failures and converts or propagates them through the error-handling path.
 * Returns: No application value; sends the HTTP response or delegates failure handling.
 */
async function validateRealFilesType(req, res, next) {
    /* Line note: Attempts the database, network, file, email, or business workflow so failures can be handled by the catch block. */
    try {
        const { fileTypeFromFile, fileTypeFromBuffer } = await getFileTypeModule();
        /* Line note: Stores files for reuse by the remaining server-side workflow. */
        let files = [];
        // single
        /* Line note: Checks whether req.file and executes the matching business, validation, or authorization branch. */
        if (req.file) {
            /* Line note: Assigns files the newly calculated or validated value. */
            files = [req.file];
        }
        // array
        else if (Array.isArray(req.files)) {
            /* Line note: Assigns files the newly calculated or validated value. */
            files = req.files;
        }
        // fields
        else if (req.files && typeof req.files === "object") {
            /* Line note: Assigns files the newly calculated or validated value. */
            files = Object.values(req.files).flat();
        }
        /* Line note: Checks whether !files.length and executes the matching business, validation, or authorization branch. */
        if (!files.length) {
            /* Line note: Returns the prepared HTTP response and stops further controller execution. */
            return res.status(400).json(
                getResponseObject(
                    getSuitableTranslations("Sorry, Files is required !!", req.query.language),
                    true,
                    null,
                    "FILE_REQUIRED",
                )
            );
        }
        /* Line note: Processes each value from files in sequence. */
        for (const file of files) {
            /* Line note: Waits for the repository, service, or asynchronous operation and stores its result in fileType. */
            const fileType = req.storageType === "memory"
                ? await fileTypeFromBuffer(file.buffer)
                : await fileTypeFromFile(file.path);

            /* Line note: Checks whether !fileType || !req.allowedMimeTypes.includes(fileType.mime) and executes the matching business, validation, or authorization branch. */
            if (!fileType || !req.allowedMimeTypes.includes(fileType.mime)) {
                /* Line note: Checks whether req.storageType !== "memory" && file.path and executes the matching business, validation, or authorization branch. */
                if (req.storageType !== "memory" && file.path) {
                    /* Line note: Attempts the database, network, file, email, or business workflow so failures can be handled by the catch block. */
                    try {
                        /* Line note: Calls unlinkSync to perform the next server-side operation. */
                        unlinkSync(file.path);
                    } catch (_) { }
                }
                /* Line note: Returns the prepared HTTP response and stops further controller execution. */
                return res.status(400).json(
                    getResponseObject(
                        getSuitableTranslations(
                            "Sorry, Invalid Real File Type ({{fileName}}) !!",
                            req.query.language,
                            { fileName: file.originalname },
                        ),
                        true,
                        null,
                        "INVALID_FILE_CONTENT",
                    )
                );
            }
        }
        /* Line note: Delegates control to the next Express middleware after the current checks pass. */
        next();
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    uploadUserImage,
    uploadRequiredFile,
    uploadOptionalFile,
    validateIsExistErrorInFiles,
    setImageValidationOptions,
    validateRealFilesType,
    parseFileNameField,
    validateFileTypeValue,
    validateUploadedFileMatchesSelectedType,
}
