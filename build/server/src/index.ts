import runHttpApi from "./api";
import runWebServer from "./webserver";
import { pollSources } from "./sources";
import * as eventBus from "./eventBus";

runHttpApi();
runWebServer();

setInterval(() => {
  pollSources();
}, 5 * 60 * 1000);

eventBus.pollSources.on(async () => {
  pollSources();
});

export {};
