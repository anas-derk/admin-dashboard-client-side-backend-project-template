const { Router, static } = require("express");
const { json } = require("body-parser");
/* Line note: Initializes cors with require("cors"). */
const cors = require("cors");
const { PUBLIC_PATH } = require("../../constants/paths");
const { globalValidator } = require("../../validators");
const { globalRateLimitMiddleware } = require("../global");

/* Line note: Initializes app with Router(). */
const app = Router();

app.use(cors({ origin: "*" }));

app.use(json({ limit: "5mb" }));

app.use(static(PUBLIC_PATH));

app.use(globalRateLimitMiddleware);

app.use(globalValidator.validateLanguage);

module.exports = app;
