/* Line note: Initializes express with require("express"). */
const express = require("express");
const environment = require("../config/environment");
/* Line note: Initializes routes with require("../routes"). */
const routes = require("../routes");
/* Line note: Initializes core middlewares with require("../middlewares/core"). */
const coreMiddlewares = require("../middlewares/core");
const { exceptionsHelpers } = require("../helpers");

/* Line note: Initializes app with express(). */
const app = express();

app.set("x-powered-by", false);
app.set("trust proxy", environment.server.trustedProxies);

app.use(coreMiddlewares);
app.use(routes);

// Exceptions handler must be registered after all routes.
app.use(exceptionsHelpers.exceptions);

module.exports = app;
