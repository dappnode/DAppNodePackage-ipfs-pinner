import express from "express";
import http from "http";
import SockerIo from "socket.io";
import cors from "cors";
import createError from "http-errors";
import path from "path";
import logger from "morgan";
import Logs from "../logs";
const logs = Logs(module);
import { getSources, getOptions, addSource, deleteSource } from "./sources";
import { getAssets } from "./assets";

// Routes

const port = 3030;

const app = express();
const server = new http.Server(app);
const io = SockerIo(server);

// default options. ALL CORS
app.use(cors());
express.json();
// Setup other options
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_0, res) => res.send("Welcome to the pinner api"));

io.on("connection", socket => {
  console.log(`Client connected ${socket.id}`);

  // Forward errors to the UI to not be blind
  socket.on("refresh", fn => {
    wrapErrors(async () => {
      socket.emit("sources", getSources());
      socket.emit("assets", await getAssets());
    }, fn);
  });

  socket.on("options", fn => {
    wrapErrors(async () => getOptions(), fn);
  });

  const refreshSources = () => socket.emit("sources", getSources());
  socket.on("addSource", (type, name, fn) => {
    wrapErrors(() => addSource(type, name), fn).then(refreshSources);
  });
  socket.on("delSource", (type, id, fn) => {
    wrapErrors(() => deleteSource(type, id), fn).then(refreshSources);
  });
});

async function wrapErrors<T>(
  dataFetch: () => Promise<T>,
  acknowledgment: (res: SocketReturn<T>) => void
): Promise<void> {
  if (!acknowledgment) logs.error("acknowledgment fn not defined");
  try {
    acknowledgment({ data: await dataFetch() });
  } catch (e) {
    logs.error(`Socket req error: ${e.stack}`);
    acknowledgment({ error: e.message });
  }
}

interface SocketReturn<T> {
  data?: T;
  error?: string;
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use((err: any, req: any, res: any, next: any) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.stack);
});

export default function runHttpApi() {
  server.listen(port, () => logs.info(`HTTP API ${port}!`));
}
