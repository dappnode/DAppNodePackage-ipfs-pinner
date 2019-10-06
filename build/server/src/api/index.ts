import * as eventBus from "../eventBus";
import Logs from "../logs";
const logs = Logs(module);

// Api Methods
import { getSources, addSource, deleteSource } from "./sources";
import { getAssets } from "./assets";
import { getOptions } from "./options";
import { getPeers } from "./peers";
import { SocketRouter } from "./utils";

const sourcesRoute = "sources";
const optionsRoute = "options";
const assetsRoute = "assets";
const peersRoute = "peers";
const addSourceRoute = "addSource";
const delSourceRoute = "delSource";
const refreshRoute = "refresh";

export default function setupSocketIo(io: SocketIO.Server) {
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
  });

  async function refresh() {
    eventBus.sourcesChanged.emit();
    eventBus.assetsChanged.emit();
  }

  // Pipe changed events to all sockets
  eventBus.sourcesChanged.on(async () => io.emit(sourcesRoute, getSources()));
  eventBus.assetsChanged.on(async () =>
    io.emit(assetsRoute, await getAssets())
  );
}
