import runHttpApi from "./api";
import { pollSourcesSafe } from "./sources";
import * as eventBus from "./eventBus";

runHttpApi();

setInterval(() => {
  pollSourcesSafe();
}, 5 * 60 * 1000);

eventBus.pollSources.on(async () => {
  pollSourcesSafe();
});

export {};
