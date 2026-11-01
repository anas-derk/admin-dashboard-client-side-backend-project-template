const { DEFAULT_CONTACT_INFORMATION } = require("../../constants/contact_information");
const { getSuitableTranslations } = require("../../helpers/translation");
const { contactInformationRepository } = require("../../repositories");

async function retrieve(language) {
    let data = await contactInformationRepository.retrieve({ singletonKey: "global" }, { lean: true });

    if (!data) {
        data = await contactInformationRepository.create({
            ...DEFAULT_CONTACT_INFORMATION,
            singletonKey: "global",
        });
    }

    return {
        code: "CONTACT_INFORMATION_RETRIEVED",
        msg: getSuitableTranslations("Get Contact Information Process Has Been Successfully !!", language),
        error: false,
        data,
    };
}

module.exports = { retrieve };
