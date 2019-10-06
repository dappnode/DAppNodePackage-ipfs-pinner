import mapValues from "lodash/mapValues";
import {
  PollSourceFunction,
  Source,
  Asset,
  VerifySourceFunction
} from "../types";
import { modifyState } from "../state";
import { pollSourcesReturnStateEdit } from "./pollSources";
import Logs from "../logs";
const logs = Logs(module);

// Aggregate sources
import * as apmDnpRepo from "./apmDnpRepo";
import * as apmRegistry from "./apmRegistry";
import * as dweb from "./dweb";

export const sources = {
  [apmDnpRepo.type]: apmDnpRepo,
  [apmRegistry.type]: apmRegistry
  // [dweb.type]: dweb
};

export const verifyFunctions: {
  [type: string]: VerifySourceFunction;
} = mapValues(sources, ({ verify }) => verify);

export const pollFunctions: {
  [type: string]: PollSourceFunction;
} = mapValues(sources, ({ poll }) => poll);

export async function pollSources() {
  try {
    await modifyState(
      async (currentSources: Source[], currentAssets: Asset[]) => {
        return await pollSourcesReturnStateEdit(pollFunctions, {
          currentAssets,
          currentSources
        });
      }
    );
  } catch (e) {
    logs.error(`Error on poll source loop: ${e.stack}`);
  }
}
