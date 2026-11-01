const { createConnection } = require("../../helpers/databases");

/* Line note: Initializes client db with createConnection("Client"). */
const clientDB = createConnection("Client");
/* Line note: Initializes dashboard db with createConnection("Dashboard"). */
const dashboardDB = createConnection("Dashboard");

module.exports = {
    clientDB,
    dashboardDB
};
