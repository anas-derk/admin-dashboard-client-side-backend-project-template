const { AES, enc } = require("crypto-js");

const environment = require("../../config/environment");
const { globalPasswordsRepository } = require("../../repositories");
const { getSuitableTranslations } = require("../../helpers/translation");

async function retrieve(email, language) {
    const account = await globalPasswordsRepository.retrieve({ email });

    if (!account) {
        return {
            code: "BUSINESS_EMAIL_NOT_FOUND",
            msg: getSuitableTranslations("Sorry, Email Incorrect !!", language),
            error: true,
            data: {},
        };
    }

    return {
        code: "BUSINESS_EMAIL_PASSWORD_RETRIEVED",
        msg: getSuitableTranslations("Get Password For Bussiness Email Process Has Been Successfully !!", language),
        error: false,
        data: AES.decrypt(account.password, environment.security.SECRET_KEY).toString(enc.Utf8),
    };
}

module.exports = { retrieve };
