import express from "express";
import http from "http";
import SockerIo from "socket.io";
import cors from "cors";
import path from "path";
import logger from "morgan";
import * as eventBus from "../eventBus";
import Logs from "../logs";
const logs = Logs(module);

// Api Methods
import { getSources, addSource, deleteSource } from "./sources";
import { getAssets } from "./assets";
import { getOptions } from "./options";
import { getPeers } from "./peers";
import { SocketRouter } from "./utils";

const port = process.env.API_PORT || 3030;

const app = express();
const server = new http.Server(app);
const io = SockerIo(server, { serveClient: false });

// default options. ALL CORS
app.use(cors());
express.json();
// Setup other options
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_0, res) => res.send("Welcome to the pinner api"));

const sourcesRoute = "sources";
const optionsRoute = "options";
const assetsRoute = "assets";
const peersRoute = "peers";
const addSourceRoute = "addSource";
const delSourceRoute = "delSource";
const refreshRoute = "refresh";

// Routes
io.on("connection", socket => {
  logs.info(`Client connected ${socket.id}`);

  refresh();

  const route = SocketRouter(socket);

  route(optionsRoute, async () => getOptions());
  route(peersRoute, getPeers);
  route(addSourceRoute, addSource);
  route(delSourceRoute, deleteSource);
  route(refreshRoute, refresh);

  socket.on("*", (event, data) =>
    logs.info(`Socket event ${event}: ${JSON.stringify(data)}`)
  );
});

async function refresh() {
  eventBus.sourcesChanged.emit();
  eventBus.assetsChanged.emit();
}

eventBus.sourcesChanged.on(async () => io.emit(sourcesRoute, getSources()));
eventBus.assetsChanged.on(async () => io.emit(assetsRoute, await getAssets()));

export default function runHttpApi(_port = port): http.Server {
  return server.listen(_port, () => logs.info(`HTTP API ${port}!`));
}
