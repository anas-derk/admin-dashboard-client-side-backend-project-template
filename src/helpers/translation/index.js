const { DEFAULT_LANGUAGE, LANGUAGES } = require("../../constants/languages");
const arTranslations = require("../../locales/ar");

const translations = {
    ar: arTranslations,
    en: {},
};

function interpolateTranslation(message, variables = {}) {
    return Object.entries(variables).reduce(
        (translatedMessage, [name, value]) => translatedMessage.replaceAll(
            `{{${name}}}`,
            String(value),
        ),
        message,
    );
}

function getSuitableTranslations(message, language = DEFAULT_LANGUAGE, variables = {}) {
    const selectedLanguage = LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
    const translatedMessage = translations[selectedLanguage]?.[message] || message;
    return interpolateTranslation(translatedMessage, variables);
}

module.exports = {
    getSuitableTranslations,
    interpolateTranslation,
};
