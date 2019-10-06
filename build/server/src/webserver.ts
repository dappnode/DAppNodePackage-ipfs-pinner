import express from "express";
import compression from "compression";
import path from "path";
const app = express();

const port = process.env.WEBSERVER_PORT || 8080;
const filesPath = path.resolve(process.env.WEBSERVER_PATH || "dist");
const indexFile = path.resolve(filesPath, "index.html");

// Express uses "ETags" (hashes of the files requested) to know when the file changed
app.use(express.static(filesPath, { maxAge: "1d" }));
app.use(compression());

// React-router needs the index.html at other routes
app.get("*", (_0, res) => res.sendFile(indexFile));

export default function runWebServer() {
  app.listen(port, () => console.log(`Webserver on ${port}, ${filesPath}`));
}

runWebServer();
