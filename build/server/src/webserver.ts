import express from "express";
const app = express();

const port = process.env.WEBSERVER_PORT || 8080;
const filesPath = process.env.WEBSERVER_PATH || "dist";

app.use(express.static(filesPath));

export default function runWebServer() {
  app.listen(port, () =>
    console.log(`Webserver on ${port} serving ${filesPath}`)
  );
}
