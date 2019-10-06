import io from "socket.io-client";
import { SourceOption, ClusterPeer } from "./types";

const apiUrl = window.location.origin;
console.log(`Connecting socket.io-client to: ${apiUrl}`);

const socket = io(apiUrl);

export default socket;

function socketGetFactory<T, R>(routePath: string) {
  return function(arg: T): Promise<R> {
    return new Promise((resolve, reject) => {
      socket.emit(routePath, arg, (res: { error: string; data: R }) => {
        if (res.error) reject(Error(res.error));
        else resolve(res.data);
      });
    });
  };
}

export const getOptions = socketGetFactory<undefined, SourceOption[]>(
  "options"
);
export const getPeers = socketGetFactory<undefined, ClusterPeer[]>("peers");
export const addSource = socketGetFactory<string, null>("addSource");
export const delSource = socketGetFactory<string, null>("delSource");
export const refresh = socketGetFactory<undefined, null>("refresh");
