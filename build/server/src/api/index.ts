import * as eventBus from "../eventBus";
import * as cacheDb from "../cacheDb";
import { logs } from "../logs";

// Api Methods
import { getSources, addSource, deleteSource } from "./sources";
import { getAssets } from "./assets";
import { getOptions } from "./options";
import { getPeers } from "./peers";
import { pingCluster } from "./clusterHealth";
import { SocketRouter } from "./utils";

const sourcesRoute = "sources";
const optionsRoute = "options";
const assetsRoute = "assets";
const peersRoute = "peers";
const pollStatusRoute = "pollStatus";
const addSourceRoute = "addSource";
const delSourceRoute = "delSource";
const refreshRoute = "refresh";
const pingClusterRoute = "pingCluster";

export default function setupSocketIo(io: SocketIO.Server): void {
  // Routes
  io.on("connection", socket => {
    logs.info(`Client connected ${socket.id}`);

    refresh();

    const route = SocketRouter(socket);

    route(optionsRoute, async () => getOptions());
    route(addSourceRoute, addSource);
    route(delSourceRoute, deleteSource);
    route(refreshRoute, refresh);
    route(pingClusterRoute, pingCluster);
  });

  async function refresh(): Promise<void> {
    eventBus.sourcesChanged.emit();
    eventBus.assetsChanged.emit();
    eventBus.emitPeers.emit();
    io.emit(pollStatusRoute, cacheDb.getPollStatus());
  }

  // Pipe changed events to all sockets
  eventBus.sourcesChanged.on(async () => {
    io.emit(sourcesRoute, await getSources());
  });
  eventBus.assetsChanged.on(async () => {
    io.emit(assetsRoute, await getAssets());
  });
  eventBus.emitPeers.on(async () => {
    io.emit(peersRoute, await getPeers());
  });
  eventBus.pollStatus.on(pollStatus => {
    io.emit(pollStatusRoute, pollStatus);
  });
}
