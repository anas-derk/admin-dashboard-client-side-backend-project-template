/* Line note: Initializes sharp with require("sharp"). */
const sharp = require("sharp");

/**
 * Function documentation: handleResizeImagesAndConvertFormatToWebp
 * Purpose: Executes the handle resize images and convert format to webp server-side workflow.
 * Parameters: files, outputImageFilePaths, newFormat = "webp", newWidth = 550, quality = 100.
 * Algorithm:
 * 1. Validates and processes the uploaded image before saving the optimized asset.
 * 2. Catches database, provider, filesystem, or processing failures and returns or propagates a controlled error.
 * Returns: No explicit value.
 */
async function handleResizeImagesAndConvertFormatToWebp(files, outputImageFilePaths, newFormat = "webp", newWidth = 550, quality = 100) {
    /* Line note: Starts a protected server operation whose failures are handled below. */
    try {
        for (let i = 0; i < files.length; i++) {
            await sharp(files[i], {
                failOn: "none"
            })
                .withMetadata()
                .rotate()
                .resize({
                    width: newWidth,
                })
                .toFormat(newFormat, {
                    quality
                })
                .toFile(outputImageFilePaths[i]);
        }
    }
    /* Line note: Handles a failure raised by the protected server operation. */
    catch (err) {
        /* Line note: Propagates err to the caller for centralized error handling. */
        throw err;
    }
}

/**
 * Function documentation: handleSaveImages
 * Purpose: Executes the handle save images server-side workflow.
 * Parameters: files, outputImageFilePaths, newWidth = 3000.
 * Algorithm:
 * 1. Validates and processes the uploaded image before saving the optimized asset.
 * 2. Catches database, provider, filesystem, or processing failures and returns or propagates a controlled error.
 * Returns: No explicit value.
 */
async function handleSaveImages(files, outputImageFilePaths, newWidth = 3000) {
    /* Line note: Starts a protected server operation whose failures are handled below. */
    try {
        for (let i = 0; i < files.length; i++) {
            await sharp(files[i], {
                failOn: "none"
            })
                .withMetadata()
                .resize({
                    width: newWidth,
                })
                .toFile(outputImageFilePaths[i]);
        }
    }
    /* Line note: Handles a failure raised by the protected server operation. */
    catch (err) {
        /* Line note: Propagates err to the caller for centralized error handling. */
        throw err;
    }
}

module.exports = {
    handleResizeImagesAndConvertFormatToWebp,
    handleSaveImages,
};
