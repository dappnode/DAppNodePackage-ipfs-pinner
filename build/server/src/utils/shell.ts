import dargs from "dargs";
import { exec, ExecOptions } from "child_process";

/**
 * If timeout is greater than 0, the parent will send the signal
 * identified by the killSignal property (the default is 'SIGTERM')
 * if the child runs longer than timeout milliseconds.
 */

const defaultTimeout = 3 * 60 * 1000; // ms
const defaultMaxBuffer = 1e7; // bytes

/**
 * Run arbitrary commands in a shell
 * If the child process exits with code > 0, rejects
 * Note: using exec instead of spawn since it's not as safe to run
 * complex arbirary commands. For example:
 * - The executable docker-compose may not be detected, causing ENOENT
 * - Doing cmd > cmd2 may fail
 * - Flags may not be passed properly
 */
export async function shell(
  cmd: string,
  options: ExecOptions = {}
): Promise<string> {
  if (!options.timeout) options.timeout = defaultTimeout;
  if (!options.maxBuffer) options.maxBuffer = defaultMaxBuffer;

  return new Promise((resolve, reject): void => {
    exec(cmd, options, (err, stdout, stderr) => {
      if (err) {
        if (err.signal === "SIGTERM")
          err.message = `cmd timeout ${options.timeout}: '${cmd}'. ${err.message}`;
        reject(err);
      } else {
        resolve(stdout.trim() || stderr);
      }
    });
  });
}

/**
 * See `shell`.
 * Parses kwargs object with `dargs` and appends the result to the command
 */
export async function shellArgs(
  command: string,
  kwargs: Parameters<typeof dargs>[0],
  options: ExecOptions = {}
): Promise<string> {
  const args = dargs(kwargs, { useEquals: false }).join(" ");
  return await shell(`${command} ${args}`, options);
}
