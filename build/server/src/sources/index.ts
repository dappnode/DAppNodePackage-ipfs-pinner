import mapValues from "lodash/mapValues";
import {
  PollSourceFunction,
  Source,
  Asset,
  VerifySourceFunction,
  CacheState,
  State
} from "../types";
import { modifyState } from "../state";
import { pollSourcesReturnStateChange } from "./pollSources";
import logs from "../logs";

// Aggregate sources
import * as apmRepo from "./apmRepo";
import * as apmRegistry from "./apmRegistry";
import * as dweb from "./dweb";
import * as hash from "./hash";

export const sources = {
  [apmRepo.type]: apmRepo,
  [apmRegistry.type]: apmRegistry,
  [dweb.type]: dweb,
  [hash.type]: hash
};

export const verifyFunctions: {
  [type: string]: VerifySourceFunction;
} = mapValues(sources, ({ verify }) => verify);

export const getMultinameFunctions: {
  [type: string]: (args: any) => string;
} = mapValues(sources, ({ getMultiname }) => getMultiname);

export const pollFunctions: {
  [type: string]: PollSourceFunction;
} = mapValues(sources, ({ poll }) => poll);

/**
 * Never throws
 */
export async function pollSources() {
  try {
    await modifyState(async (state: State) => {
      return await pollSourcesReturnStateChange(pollFunctions, state);
    });
  } catch (e) {
    logs.error("Error on poll source loop: ", e);
  }
}
