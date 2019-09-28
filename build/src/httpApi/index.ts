import express from "express";
import cors from "cors";
import createError from "http-errors";
import path from "path";
import logger from "morgan";
import Logs from "../logs";
const logs = Logs(module);

// Routes
import indexRouter from "./routes/index";
import usersRouter from "./routes/users";

const app = express();
const port = 3000;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "tsx");
app.engine("tsx", require("express-react-views").createEngine());

// default options. ALL CORS
app.use(cors());
// Setup other options
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Setup routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

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

/**
 * Endpoint to download files.
 * File must be previously available at the specified fileId
 * - Only available to admin users
 */
// app.get("/download/:fileId", async (req, res) => {
//   // Protect for a range of IPs, req.ip = "::ffff:172.33.10.1";
//   if (!req.ip.includes(adminIpPrefix))
//     return res.status(403).send(`Forbidden ip: ${req.ip}`);

//   const { fileId } = req.params;
//   const filePath = db.fileTransferPath.get(fileId);

//   // If path does not exist, return error
//   if (!filePath) return res.status(404).send("File not found");

//   // Remove the fileId from the DB FIRST to prevent reply attacks
//   db.fileTransferPath.remove(fileId);
//   return res.download(filePath, errHttp => {
//     if (!errHttp)
//       fs.unlink(filePath, errFs => {
//         if (errFs) logs.error(`Error deleting file: ${errFs.message}`);
//       });
//   });
// });

export default function runHttpApi() {
  app.listen(port, () => logs.info(`HTTP API ${port}!`));
}
