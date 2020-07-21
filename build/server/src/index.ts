import express from "express";
import http from "http";
import SockerIo from "socket.io";
import compression from "compression";
import path from "path";
import logger from "morgan";
import cors from "cors";
import memoize from "memoizee";
import setupSocketIo from "./api";
import { pollSources } from "./sources";
import * as eventBus from "./eventBus";
import { logs } from "./logs";
// Display stack traces with source-maps
import "source-map-support/register";
import { initializeCluster } from "./clusterBinary";
import { getServerName } from "./utils/getGlobalEnvs";

const app = express();

const port = process.env.SERVER_PORT || 8080;
const filesPath = path.resolve(process.env.CLIENT_FILES_PATH || "dist");

// Setup SocketIo
const server = new http.Server(app);
const io = SockerIo(server, { serveClient: false });
setupSocketIo(io);

// Configure Express
app.use(cors()); // default options. ALL CORS
app.use(logger("dev")); // Log requests in "dev" format
app.use(compression());

// Express uses "ETags" (hashes of the files requested) to know when the file changed
app.use(express.static(filesPath, { maxAge: "1d" }));
app.get("*", (_0, res) => res.sendFile(path.resolve(filesPath, "index.html"))); // React-router, index.html at all routes

server.listen(port, () => logs.info(`Webserver on ${port}, ${filesPath}`));

// MUST run only once at a time
const pollSourcesMem = memoize(pollSources, { promise: true, maxAge: 1000 });

// Cron job to poll pin sources
setInterval(() => {
  pollSourcesMem();
}, 5 * 60 * 1000);

eventBus.pollSources.on(async () => {
  pollSourcesMem();
});

// Initialize ipfs-cluster-service and start the process
getServerName()
  .catch(e => logs.error(`Error getting server name`, e))
  .then(serverName => initializeCluster({ peername: serverName || "DAppNode" }))
  .then(() => logs.info(`Initialized cluster`))
  .catch(e => {
    logs.error(`Error initializing cluster: ${e.message}`);
    process.exit(1);
  });

export {}; // Force ES6 module
