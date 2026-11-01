const { compare, hash } = require("bcryptjs");

const { getSuitableTranslations } = require("../../helpers/translation");
const { usersRepository } = require("../../repositories");
const authSessionsService = require("../auth_sessions");

async function retrieve(userId, language) {
    const user = await usersRepository.retrieve(userId);

    if (!user) {
        return {
            code: "USER_NOT_FOUND",
            msg: getSuitableTranslations("Sorry, This User Is Not Exist !!", language),
            error: true,
            data: {},
        };
    }

    return {
        code: "USER_RETRIEVED",
        msg: getSuitableTranslations("Get User Info Process Has Been Successfully !!", language),
        error: false,
        data: user,
    };
}

async function update(userId, newUserData, language) {
    const user = await usersRepository.retrieve(
        userId,
        newUserData.password ? { projection: "+password" } : undefined,
    );
    if (!user) return userNotFound(language);

    const updates = { ...newUserData };
    if (newUserData.password && newUserData.newPassword) {
        if (!user.password || !(await compare(newUserData.password, user.password))) {
            return {
                code: "INVALID_PASSWORD",
                msg: getSuitableTranslations("Sorry, This Password Is Uncorrect !!", language),
                error: true,
                data: {},
            };
        }
        updates.password = await hash(newUserData.newPassword, 10);
        delete updates.newPassword;
    }

    const emailChanged = newUserData.email && newUserData.email !== user.email;
    if (emailChanged) {
        if (user.provider !== "same-site") {
            return {
                code: "EMAIL_MANAGED_BY_AUTH_PROVIDER",
                msg: getSuitableTranslations("Sorry, This Email Is Managed By The Authentication Provider !!", language),
                error: true,
                data: {},
            };
        }
        const emailOwner = await usersRepository.retrieve({ email: newUserData.email });
        if (emailOwner) return emailAlreadyExists(language);
        updates.isVerified = false;
    }

    try {
        await usersRepository.update(user, updates);
    }
    catch (error) {
        if (error?.code === 11000) return emailAlreadyExists(language);
        throw error;
    }
    if (newUserData.newPassword || emailChanged) await authSessionsService.revokeAll(user._id);
    return {
        code: "USER_UPDATED",
        msg: getSuitableTranslations("Updating User Info Process Has Been Successfuly !!", language),
        error: false,
        data: emailChanged ? { requiresVerification: true } : {},
    };
}

async function updateImage(userId, newImagePath, language) {
    const user = await usersRepository.retrieve(userId);
    if (!user) return userNotFound(language);

    const oldImagePath = user.imagePath;
    await usersRepository.update(user, { imagePath: newImagePath });
    return {
        code: "USER_IMAGE_UPDATED",
        msg: getSuitableTranslations("Updating User Image Process Has Been Successfully !!", language),
        error: false,
        data: { deletedUserImagePath: oldImagePath },
    };
}

async function remove(userId, language) {
    const user = await usersRepository.retrieve(userId);
    if (!user) return userNotFound(language);

    await authSessionsService.revokeAll(user._id);
    await usersRepository.delete(user);
    return {
        code: "USER_DELETED",
        msg: getSuitableTranslations("Deleting User Process Has Been Successfully !!", language),
        error: false,
        data: user.imagePath ? { deletedUserImagePath: user.imagePath } : {},
    };
}

function userNotFound(language) {
    return {
        code: "USER_NOT_FOUND",
        msg: getSuitableTranslations("Sorry, This User Is Not Exist !!", language),
        error: true,
        data: {},
    };
}

function emailAlreadyExists(language) {
    return {
        code: "EMAIL_ALREADY_EXISTS",
        msg: getSuitableTranslations("Sorry, This Email Is Already Exist !!", language),
        error: true,
        status: 409,
        data: {},
    };
}

module.exports = {
    delete: remove,
    retrieve,
    update,
    updateImage,
};
