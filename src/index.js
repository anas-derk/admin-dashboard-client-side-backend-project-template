const environment = require("./config/environment");
const redis = require("./config/redis");
const { clientDB, dashboardDB } = require("./database/connections");
const server = require("./http");

const PORT = environment.server.port;
const SHUTDOWN_TIMEOUT_MS = 10_000;

let httpServer = null;
let shuttingDown = false;

function closeHttpServer() {
    if (!httpServer?.listening) return Promise.resolve();

    return new Promise((resolve, reject) => {
        httpServer.close((error) => {
            if (error) return reject(error);
            return resolve();
        });
        httpServer.closeIdleConnections?.();
    });
}

async function closeRedis() {
    if (redis.status === "ready") {
        await redis.quit();
        return;
    }

    redis.disconnect();
}

async function shutdown(reason, error = null) {
    if (shuttingDown) return;
    shuttingDown = true;

    if (error) console.error(`${reason}:`, error);
    else console.log(`${reason}; shutting down gracefully.`);

    const forceShutdownTimer = setTimeout(() => {
        console.error("Graceful shutdown timed out.");
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceShutdownTimer.unref();

    const applicationResults = await Promise.allSettled([closeHttpServer()]);
    const infrastructureResults = await Promise.allSettled([
        clientDB.readyState ? clientDB.close() : Promise.resolve(),
        dashboardDB.readyState ? dashboardDB.close() : Promise.resolve(),
        closeRedis(),
    ]);

    clearTimeout(forceShutdownTimer);
    [...applicationResults, ...infrastructureResults]
        .filter((result) => result.status === "rejected")
        .forEach((result) => console.error("Shutdown error:", result.reason));

    process.exitCode = error ? 1 : 0;
}

async function startServer() {
    try {
        await Promise.all([
            clientDB.openUri(environment.databases.clientUrl),
            dashboardDB.openUri(environment.databases.dashboardUrl),
        ]);
        await redis.connect();
        await redis.ping();

        httpServer = server.listen(PORT, () => {
            console.log(`Server Listening On Port ${PORT}`);
        });
        httpServer.on("error", (error) => {
            void shutdown("HTTP server error", error);
        });
    }
    catch (error) {
        await shutdown("Failed to start server", error);
    }
}

process.once("SIGINT", () => {
    void shutdown("SIGINT received");
});
process.once("SIGTERM", () => {
    void shutdown("SIGTERM received");
});
process.once("uncaughtException", (error) => {
    void shutdown("Uncaught exception", error);
});
process.once("unhandledRejection", (error) => {
    void shutdown("Unhandled rejection", error);
});
clientDB.on("error", (error) => {
    void shutdown("Client database connection error", error);
});
dashboardDB.on("error", (error) => {
    void shutdown("Dashboard database connection error", error);
});

void startServer();
