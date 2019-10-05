import io from "socket.io-client";
import { SourceOption, ClusterPeer } from "./types";

const apiUrl = `http://localhost:3030`;

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

/**
 * Special is alive check
 */

export async function isAlive(): Promise<{ alive: boolean; error?: string }> {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok)
      return {
        alive: false,
        error: res.statusText
      };
    const data = await res.text();
    if (data === "Welcome to the pinner api")
      console.error(`Warning, the welcome text is not expected: ${data}`);
    return {
      alive: true
    };
  } catch (e) {
    return {
      alive: false,
      error: e.message
    };
  }
}
