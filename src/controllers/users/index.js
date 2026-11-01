const { existsSync, mkdirSync, unlinkSync } = require("fs");
const { randomUUID } = require("crypto");
const { basename, extname, isAbsolute, join, resolve, sep } = require("path");

const { PUBLIC_PATH, USER_IMAGES_UPLOAD_PATH } = require("../../constants/paths");
const { exceptionsHelpers, responsesHelpers } = require("../../helpers");
const { usersService } = require("../../services");
const { handleResizeImagesAndConvertFormatToWebp } = require("../../utils/files");

const { throwIfError } = exceptionsHelpers;
const { getApiResponse } = responsesHelpers;

async function getUserInfo(req, res, next) {
    try {
        const result = await usersService.retrieve(req.data._id, req.query.language);
        throwIfError(result);
        return res.status(200).json(getApiResponse(result));
    }
    catch (error) {
        return next(error);
    }
}

async function putUserInfo(req, res, next) {
    try {
        const result = await usersService.update(req.data._id, req.body, req.query.language);
        throwIfError(result);
        return res.status(201).json(getApiResponse(result));
    }
    catch (error) {
        return next(error);
    }
}

async function putUserImage(req, res, next) {
    let outputImageFilePath;

    try {
        mkdirSync(USER_IMAGES_UPLOAD_PATH, { recursive: true });
        const originalName = basename(req.file.originalname, extname(req.file.originalname));
        const safeName = originalName.replace(/[^\p{L}\p{N}_-]+/gu, "_");
        const fileName = `${randomUUID()}_${safeName}.webp`;
        const publicImagePath = `/uploads/users/${fileName}`;
        outputImageFilePath = join(USER_IMAGES_UPLOAD_PATH, fileName);
        await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], [outputImageFilePath]);

        const result = await usersService.updateImage(
            req.data._id,
            publicImagePath,
            req.query.language,
        );
        if (result.error) removeImage(outputImageFilePath);
        throwIfError(result);

        removeImage(result.data.deletedUserImagePath);
        return res.status(201).json(getApiResponse(result, { newImagePath: publicImagePath }));
    }
    catch (error) {
        if (outputImageFilePath) removeImage(outputImageFilePath);
        return next(error);
    }
}

async function deleteUser(req, res, next) {
    try {
        const result = await usersService.delete(
            req.data._id,
            req.query.language,
        );
        throwIfError(result);

        removeImage(result.data.deletedUserImagePath);
        return res.status(202).json(getApiResponse(result));
    }
    catch (error) {
        return next(error);
    }
}

function removeImage(imagePath) {
    if (!imagePath || imagePath === "/images/defaultProfileImage.png") return;

    const relativePath = imagePath.replace(/^[\\/]+/, "");
    const filePath = isAbsolute(imagePath) ? resolve(imagePath) : resolve(PUBLIC_PATH, relativePath);
    const publicRoot = `${resolve(PUBLIC_PATH)}${sep}`;

    if (!filePath.startsWith(publicRoot)) return;
    if (existsSync(filePath)) unlinkSync(filePath);
}

module.exports = {
    deleteUser,
    getUserInfo,
    putUserImage,
    putUserInfo,
};
