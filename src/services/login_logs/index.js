const { loginLogsRepository } = require("../../repositories");

async function create(data) {
    try {
        return await loginLogsRepository.create(data);
    }
    catch (error) {
        console.error(`Unable to create login log: ${error?.message ?? error}`);
        return null;
    }
}

module.exports = { create };
