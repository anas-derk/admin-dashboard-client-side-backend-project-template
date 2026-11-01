const { responsesHelpers } = require("../../helpers");
const { contactInformationService } = require("../../services");

const { getApiResponse } = responsesHelpers;

async function getContactInformation(req, res, next) {
    try {
        const result = await contactInformationService.retrieve(req.query.language);
        return res.json(getApiResponse(result));
    }
    catch (error) {
        return next(error);
    }
}

module.exports = { getContactInformation };
