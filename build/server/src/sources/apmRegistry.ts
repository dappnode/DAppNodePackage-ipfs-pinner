import { mapKeys } from "lodash";
import { PollSourceFunction, PollSourceFunctionArg } from "../types";
import fetchNewApmRepos from "../fetchers/fetchNewApmRepos";
import { splitMultiname, joinMultiname } from "../utils/multiname";
import fetchBlockNumber from "../fetchers/fetchBlockNumber";
import * as apmDnpRepo from "./apmDnpRepo";

const repoBlacklist: { [name: string]: true } = {
  "testing.dnp.dappnode.eth": true,
  "telegram-mtpproto.dnp.dappnode.eth.dnp.dappnode.eth": true
};

/**
 * APM Registry
 *
 * type:
 * `apm-registry`
 *
 * multiname structure:
 * `/apm-registry/dnp.dappnode.eth`
 */

export interface ApmRegistry {
  name: string;
}

export const type = "apm-registry";

export const parseMultiname = (multiname: string): ApmRegistry => {
  const [_type, name] = splitMultiname(multiname);
  if (!name) throw Error(`No "name" in multiname: ${multiname}`);
  return { name };
};

export const getMultiname = ({ name }: ApmRegistry): string => {
  return joinMultiname([type, name]);
};

export const poll: PollSourceFunction = async function({
  source,
  currentOwnSources,
  internalState: lastBlock
}: PollSourceFunctionArg) {
  const { name } = parseMultiname(source.multiname);
  const fromBlock = parseInt(lastBlock);
  const newRepos = await fetchNewApmRepos(name, fromBlock);
  const currentLastBlock = await fetchBlockNumber();

  const currentRepos = mapKeys(currentOwnSources, ({ multiname }) => multiname);
  return {
    sourcesToAdd: newRepos
      .map(repo => ({
        multiname: apmDnpRepo.getMultiname({
          name: [repo.shortname, name].join(".") // Repo full ENS domain
        })
      }))
      .filter(({ multiname }) => !currentRepos[multiname]),
    internalState: String(currentLastBlock)
  };
};
