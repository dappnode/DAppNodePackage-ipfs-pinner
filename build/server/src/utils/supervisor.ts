import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";

const signalsToPass: NodeJS.Signals[] = [
  "SIGTERM",
  "SIGINT",
  "SIGHUP",
  "SIGQUIT"
];

/**
 * Restarts a child process when it crashes
 * A restart can also be triggered manually
 * Typescript translation of https://github.com/petruisfan/node-supervisor
 * @param command
 * @param args
 * @param options
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Supervisor(
  command: string,
  args: string[],
  options?: {
    instantKill?: boolean; // Kill process immediately with "SIGKILL"
    restartWait?: number; // Wait between restarts
    log?: (message: string) => void;
  }
) {
  const { instantKill, restartWait = 1000, log = console.log } = options || {};
  // State
  let child: ChildProcess | null = null;
  let crashQueued = false;
  // Events
  const eventEmitter = new EventEmitter();

  // Pass kill signals through to child
  for (const signal of signalsToPass) {
    process.on(signal, function() {
      killChild(signal);
      process.exit();
    });
  }
  process.on("exit", function() {
    killChild("SIGTERM");
  });

  function killChild(signal: NodeJS.Signals): void {
    if (child) {
      log("Received " + signal + ", killing child process...");
      child.kill(signal);
    }
  }

  function startChild(): void {
    crashQueued = false;
    child = spawn(command, args, { stdio: "inherit" });
    log(
      `Starting child process with '${command} ${args.join(" ")}' ${child.pid}`
    );

    // Pipe output to process
    if (child.stdout) child.stdout.pipe(process.stdout);
    if (child.stderr) child.stderr.pipe(process.stderr);

    // Log output to internal event emitter
    const onData = (chunk: Buffer) =>
      eventEmitter.emit("data", chunk.toString());
    if (child.stdout) child.stdout.on("data", onData);
    if (child.stderr) child.stderr.on("data", onData);

    child.addListener("exit", function(code) {
      if (!crashQueued) {
        log(`Program ${command} ${args.join(" ")} exited with code ${code}`);
        if (child) {
          if (child.stdout) child.stdout.removeAllListeners();
          if (child.stderr) child.stderr.removeAllListeners();
          child = null;
        }
      }
      setTimeout(startChild, restartWait);
    });
  }

  return {
    restart(): void {
      if (crashQueued) return;

      crashQueued = true;
      setTimeout(function() {
        if (!child) return startChild();
        if (instantKill) {
          process.kill(child.pid, "SIGKILL");
        } else {
          process.kill(child.pid, "SIGTERM");
        }
      }, 50);
    },

    onData(cb: (data: string) => void): void {
      eventEmitter.on("data", cb);
    },

    offData(cb: (data: string) => void): void {
      eventEmitter.off("data", cb);
    },

    child
  };
}
