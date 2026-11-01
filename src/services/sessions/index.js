const { clientDB } = require("../../database/connections");
const { getSuitableTranslations } = require("../../helpers/translation");
const { sessionsRepository } = require("../../repositories");

async function retrieve(sessionId, language) {
    const session = await sessionsRepository.retrieve(sessionId);

    if (!session) {
        return {
            code: "SESSION_NOT_FOUND",
            msg: getSuitableTranslations("Sorry, This Session Is Not Exist !!", language),
            error: true,
            data: {},
        };
    }

    return {
        code: "SESSION_RETRIEVED",
        msg: getSuitableTranslations("Get Session Process Has Been Successfully !!", language),
        error: false,
        data: session,
    };
}

async function checkOrCreate(email, typeOfUse, language, dbSession = null) {
    let internalSession = false;

    try {
        let session = await sessionsRepository.retrieve({ email, typeOfUse });

        if (!session) {
            if (!dbSession) {
                dbSession = await clientDB.startSession();
                dbSession.startTransaction();
                internalSession = true;
            }

            session = await sessionsRepository.create({ email, typeOfUse }, { session: dbSession });

            if (internalSession) {
                await dbSession.commitTransaction();
                await dbSession.endSession();
            }
        }

        return {
            code: "SESSION_CREATED",
            msg: getSuitableTranslations("Creating New Session Process Has Been Successfully !!", language),
            error: false,
            data: session,
        };
    }
    catch (error) {
        if (internalSession && dbSession) {
            await dbSession.abortTransaction();
            await dbSession.endSession();
        }
        throw error;
    }
}

module.exports = { checkOrCreate, retrieve };
