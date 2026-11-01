const { createTransport } = require("nodemailer");
const { join } = require("path");
const { readFileSync } = require("fs");
const { compile } = require("ejs");
const environment = require("../../config/environment");
const { EMAIL_SUBJECTS } = require("../../constants/emails");
const { DEFAULT_LANGUAGE, LANGUAGES } = require("../../constants/languages");
const { BUSINESS_EMAIL, WEBSITE_COLOR, WEBSITE_NAME } = require("../../constants/website");
const globalPasswordsService = require("../../services/global_passwords");
const { getDateFormated } = require("../common");

function normalizeEmailLanguage(language) {
    return LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

function getEmailSubject(type, language) {
    const selectedLanguage = normalizeEmailLanguage(language);
    return EMAIL_SUBJECTS[type][selectedLanguage].replace("{{websiteName}}", WEBSITE_NAME);
}

/**
 * Function documentation: getTransporter
 * Purpose: Retrieves transporter from the relevant data source.
 * Parameters: None.
 * Algorithm:
 * 1. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
function getTransporter() {
    const { host, port, username, password } = environment.smtp;

    /* Line note: Checks the following business or authorization condition before continuing. */
    if (!username || !password) {
        /* Line note: Propagates new Error("Sender SMTP credentials are missing. Please set SMTP_USERNAME and SMTP_PASSWORD.") to the caller for centralized error handling. */
        throw new Error("Sender SMTP credentials are missing. Please set SMTP_USERNAME and SMTP_PASSWORD.");
    }

    /* Line note: Returns createTransport({ to the caller. */
    return createTransport({
        host,
        port,
        secure: port === 465,
        requireTLS: port !== 465,
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 30_000,
        auth: {
            user: username,
            pass: password,
        },
        tls: {
            minVersion: "TLSv1.2",
        },
    });
}

/**
 * Function documentation: compileEmailTemplate
 * Purpose: Executes the compile email template server-side workflow.
 * Parameters: templateName, data.
 * Algorithm:
 * 1. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
function compileEmailTemplate(templateName, data) {
    /* Line note: Loads the private email template from src/templates/emails. */
    const templateContent = readFileSync(join(__dirname, "..", "..", "templates", "emails", templateName), "utf-8");
    /* Line note: Initializes compiled template with compile(templateContent). */
    const compiledTemplate = compile(templateContent);
    /* Line note: Returns compiledTemplate(data) to the caller. */
    return compiledTemplate({
        baseApiImagesUrl: environment.urls.baseApiImages,
        businessEmail: BUSINESS_EMAIL,
        websiteColor: WEBSITE_COLOR,
        websiteName: WEBSITE_NAME,
        websiteUrl: environment.urls.website,
        ...data,
    });
}

/**
 * Function documentation: sendMail
 * Purpose: Executes the send mail server-side workflow.
 * Parameters: bussinessEmailPassword, mailConfigurations.
 * Algorithm:
 * 1. Builds and sends the localized transactional email to the intended recipient.
 * 2. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
function sendMail(bussinessEmailPassword, mailConfigurations) {
    /* Line note: Returns new Promise((resolve, reject) => { to the caller. */
    return new Promise((resolve, reject) => {
        getTransporter().sendMail(mailConfigurations, function (error, info) {
            /* Line note: Checks the following business or authorization condition before continuing. */
            if (error) return reject(error);
            resolve(info);
        });
    });
}

/**
 * Function documentation: sendVerificationCodeToUserEmail
 * Purpose: Executes the send verification code to user email server-side workflow.
 * Parameters: email, generatedCode, language.
 * Algorithm:
 * 1. Builds and sends the localized transactional email to the intended recipient.
 * 2. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
async function sendVerificationCodeToUserEmail(email, generatedCode, language) {
    /* Line note: Retrieves the configured business email password. */
    const result = await globalPasswordsService.retrieve(BUSINESS_EMAIL);
    /* Line note: Checks the following business or authorization condition before continuing. */
    if (!result.error) {
        const selectedLanguage = normalizeEmailLanguage(language);
        const html = compileEmailTemplate("email_template.ejs", { generatedCode, language: selectedLanguage });
        await sendMail(result.data, {
            from: `${WEBSITE_NAME} <${BUSINESS_EMAIL}>`,
            to: email,
            subject: getEmailSubject("verification", selectedLanguage),
            html,
        });
        /* Line note: Returns { to the caller. */
        return {
            msg: "Sending Confirmation Code Process Has Been Successfully !!",
            error: false,
            data: generatedCode,
        };
    }
    /* Line note: Returns the prepared result result to the caller. */
    return result;
}

/**
 * Function documentation: sendCongratulationsOnCreatingNewAccountEmail
 * Purpose: Executes the send congratulations on creating new account email server-side workflow.
 * Parameters: email, language.
 * Algorithm:
 * 1. Builds and sends the localized transactional email to the intended recipient.
 * 2. Selects the localized response message using the requested language.
 * 3. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
async function sendCongratulationsOnCreatingNewAccountEmail(email, language) {
    /* Line note: Retrieves the configured business email password. */
    const result = await globalPasswordsService.retrieve(BUSINESS_EMAIL);
    /* Line note: Checks the following business or authorization condition before continuing. */
    if (!result.error) {
        const selectedLanguage = normalizeEmailLanguage(language);
        const html = compileEmailTemplate("congratulations_creating_new_account.ejs", {
            email,
            language: selectedLanguage,
        });
        await sendMail(result.data, {
            from: `${WEBSITE_NAME} <${BUSINESS_EMAIL}>`,
            to: email,
            subject: getEmailSubject("welcome", selectedLanguage),
            html,
        });
        /* Line note: Returns { to the caller. */
        return {
            msg: "Sending Congratulations Email To User Process Has Been Successfully !!",
            error: false,
            data: {},
        };
    }
    /* Line note: Returns the prepared result result to the caller. */
    return result;
}

/**
 * Function documentation: sendChangePasswordEmail
 * Purpose: Executes the send change password email server-side workflow.
 * Parameters: email, language.
 * Algorithm:
 * 1. Builds and sends the localized transactional email to the intended recipient.
 * 2. Selects the localized response message using the requested language.
 * 3. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
async function sendChangePasswordEmail(email, language) {
    /* Line note: Retrieves the configured business email password. */
    const result = await globalPasswordsService.retrieve(BUSINESS_EMAIL);
    /* Line note: Checks the following business or authorization condition before continuing. */
    if (!result.error) {
        const selectedLanguage = normalizeEmailLanguage(language);
        const html = compileEmailTemplate("change_password.ejs", {
            date: getDateFormated(Date.now()),
            language: selectedLanguage,
        });
        await sendMail(result.data, {
            from: `${WEBSITE_NAME} <${BUSINESS_EMAIL}>`,
            to: email,
            subject: getEmailSubject("passwordChanged", selectedLanguage),
            html,
        });
        /* Line note: Returns { to the caller. */
        return {
            msg: "Sending Change The User Password Email Process Has Been Successfully !!",
            error: false,
            data: {},
        };
    }
    /* Line note: Returns the prepared result result to the caller. */
    return result;
}

/**
 * Function documentation: sendAccountDeletedByUserRequestEmail
 * Purpose: Executes the send account deleted by user request email server-side workflow.
 * Parameters: email, language.
 * Algorithm:
 * 1. Builds and sends the localized transactional email to the intended recipient.
 * 2. Selects the localized response message using the requested language.
 * 3. Returns the resulting entity, response object, validation decision, or calculated value to the caller.
 * Returns: The resulting entity, response, decision, or calculated value.
 */
async function sendAccountDeletedByUserRequestEmail(email, language) {
    /* Line note: Retrieves the configured business email password. */
    const result = await globalPasswordsService.retrieve(BUSINESS_EMAIL);
    /* Line note: Checks the following business or authorization condition before continuing. */
    if (!result.error) {
        const selectedLanguage = normalizeEmailLanguage(language);
        const html = compileEmailTemplate("delete_account_by_user_request.ejs", {
            language: selectedLanguage,
        });
        await sendMail(result.data, {
            from: `${WEBSITE_NAME} <${BUSINESS_EMAIL}>`,
            to: email,
            subject: getEmailSubject("accountDeleted", selectedLanguage),
            html,
        });
        /* Line note: Returns { to the caller. */
        return {
            msg: "Sending Account Deletion Email Process Has Been Successfully !!",
            error: false,
            data: {},
        };
    }
    /* Line note: Returns the prepared result result to the caller. */
    return result;
}

module.exports = {
    sendVerificationCodeToUserEmail,
    sendCongratulationsOnCreatingNewAccountEmail,
    sendChangePasswordEmail,
    sendAccountDeletedByUserRequestEmail,
};
