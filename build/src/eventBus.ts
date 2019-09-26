import EventEmitter from "events";
import Logs from "./logs";
import { ApmRegistry, ApmRepo, ApmVersion, DistributedFile } from "./types";
const logs = Logs(module);

/** HOW TO:
 * - ON:
 * eventBus.on(eventBusTag.logUi, (data) => {
 *   doStuff(data);
 * });
 *
 * - EMIT:
 * eventBus.emit(eventBusTag.logUi, data);
 */
class MyEmitter extends EventEmitter {}

const eventBus = new MyEmitter();

/**
 * Offer a default mechanism to run listeners within a try/catch block
 *
 * [NOTE] Error parsing `e.stack || e.message || e` is necessary because
 * there has been instances where the error captured didn't had the stack
 * property
 */

function eventBusOnSafe<T>(
  eventName: string,
  listener: (arg: T) => void,
  errorGetter: (arg: T) => string
): void {
  eventBus.on(eventName, (arg: T) => {
    try {
      listener(arg);
    } catch (e) {
      logs.error(`Error ${errorGetter(arg)}: ${e.stack || e.message || e}`);
    }
  });
}

function eventBusOnSafeAsync<T>(
  eventName: string,
  listener: (arg: T) => void,
  errorGetter: (arg: T) => string
): void {
  eventBus.on(eventName, async (arg: T) => {
    try {
      await listener(arg);
    } catch (e) {
      logs.error(`Error ${errorGetter(arg)}: ${e.stack || e.message || e}`);
    }
  });
}

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
// const busFactoryNoArgAsync = (event: string) => ({
//   on: (listener: () => Promise<void>): void =>
//     eventBusOnSafeAsync(event, listener),
//   emit: (): void => {
//     eventBus.emit(event);
//   }
// });
/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
const busFactoryNoArg = (event: string) => ({
  on: (listener: () => void): void =>
    eventBusOnSafe(event, listener, () => `on event ${event}`),
  emit: (): void => {
    eventBus.emit(event);
  }
});
const busFactoryAsync = <T>(
  event: string,
  errorGetter: (arg: T) => string
) => ({
  on: (listener: (arg: T) => Promise<void>) =>
    eventBusOnSafeAsync<T>(event, listener, errorGetter),
  emit: (arg: T): void => {
    eventBus.emit(event, arg);
  }
});
/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
// const busFactory = <T>(event: string, errorGetter: (arg: T) => string) => ({
//   on: (listener: (arg: T) => void): void =>
//     eventBusOnSafe<T>(event, listener, errorGetter),
//   emit: (arg: T): void => {
//     eventBus.emit(event, arg);
//   }
// });

export const apmRegistry = busFactoryAsync<ApmRegistry>(
  "APM_REGISTRY",
  registry => `on registry ${registry.name}`
);
export const apmRepo = busFactoryAsync<ApmRepo>(
  "APM_REPO",
  repo => `on repo ${repo.name}`
);
export const apmVersion = busFactoryAsync<ApmVersion>(
  "APM_VERSION",
  version => `on version ${version.name} ${version.version}`
);
export const file = busFactoryAsync<DistributedFile>(
  "DISTRIBUTED_FILE",
  file => `on file ${file.source.name}`
);
export const pin = busFactoryNoArg("PIN");
