const Redis = require("ioredis");
const environment = require("../environment");

const { host, port, db, username, password, tls } = environment.redis;

const redis = new Redis({
    host,
    port,
    db,
    ...(username && { username }),
    ...(password && { password }),
    ...(tls && { tls: {} }),
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
});

redis.on("error", (error) => {
    console.error(`Redis Error: ${error?.message ?? error}`);
});

module.exports = redis;
