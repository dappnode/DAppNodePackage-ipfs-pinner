import runHttpApi from "./api";
import { pollSources } from "./sources";
import * as eventBus from "./eventBus";

runHttpApi();

setInterval(() => {
  pollSources();
}, 5 * 60 * 1000);

eventBus.pollSources.on(async () => {
  pollSources();
});

export {};
