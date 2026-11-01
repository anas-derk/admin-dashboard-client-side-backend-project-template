const mongoose = require("mongoose");

const { dashboardDB } = require("../../../database/connections");

const contactInformationSchema = new mongoose.Schema({
    singletonKey: { type: String, default: "global", immutable: true },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    whatsappNumber: { type: String, required: true, trim: true },
    facebookUrl: { type: String, trim: true },
    instagramUrl: { type: String, trim: true },
    xUrl: { type: String, trim: true },
    tiktokUrl: { type: String, trim: true },
}, { timestamps: true });

contactInformationSchema.index({ singletonKey: 1 }, { unique: true });

const contactInformationModel = dashboardDB.model("contact_information", contactInformationSchema);

module.exports = contactInformationModel;