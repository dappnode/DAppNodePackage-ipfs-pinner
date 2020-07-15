import EventEmitter from "events";
import { logs } from "./logs";
import { Source, PollStatus } from "./types";

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
  listener: (arg: T) => void
): void {
  eventBus.on(eventName, (arg: T) => {
    try {
      listener(arg);
    } catch (e) {
      logs.error(`Error on event ${eventName}: `, e);
    }
  });
}

function eventBusOnSafeAsync<T>(
  eventName: string,
  listener: (arg: T) => void
): void {
  eventBus.on(eventName, async (arg: T) => {
    try {
      await listener(arg);
    } catch (e) {
      logs.error(`Error on event ${eventName}: `, e);
    }
  });
}

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
const busFactoryNoArgAsync = (event: string) => ({
  on: (listener: () => Promise<void>): void =>
    eventBusOnSafeAsync(event, listener),
  emit: (): void => {
    eventBus.emit(event);
  }
});
/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
// const busFactoryNoArg = (event: string) => ({
//   on: (listener: () => void): void => eventBusOnSafe(event, listener),
//   emit: (): void => {
//     eventBus.emit(event);
//   }
// });
/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
const busFactoryAsync = <T>(event: string) => ({
  on: (listener: (arg: T) => Promise<void>): void =>
    eventBusOnSafeAsync<T>(event, listener),
  emit: (arg: T): void => {
    eventBus.emit(event, arg);
  }
});
/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
const busFactory = <T>(event: string) => ({
  on: (listener: (arg: T) => void): void => eventBusOnSafe<T>(event, listener),
  emit: (arg: T): void => {
    eventBus.emit(event, arg);
  }
});

export const pollSources = busFactoryAsync<Source[]>("POLL_SOURCES");
export const sourcesChanged = busFactoryNoArgAsync("SOURCES_CHANGED");
export const assetsChanged = busFactoryNoArgAsync("ASSETS_CHANGED");
export const emitPeers = busFactoryNoArgAsync("EMIT_PEERS");

export const pollStatus = busFactory<PollStatus>("POLL_STATUS");
