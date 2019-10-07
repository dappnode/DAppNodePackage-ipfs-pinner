import { createLogger, format, transports } from "winston";

const LOG_LEVEL = process.env.LOG_LEVEL;

// Make sure that the error level is correct, or default to "info"
const logLevel =
  LOG_LEVEL === "error"
    ? "error"
    : LOG_LEVEL === "warn"
    ? "warn"
    : LOG_LEVEL === "verbose"
    ? "verbose"
    : LOG_LEVEL === "debug"
    ? "debug"
    : "info";

/**
 * @returns logs. Usage
 *
 * [Sample-code]
 * logger.info("Some info logg!");
 * logger.warn("A warning log");
 * logger.error("An Error log!");
 * logger.info("Add extra params", { label: "ssa" });
 * logger.error("Prepend error message ", new Error("Ops!!"));
 *
 * [Sample-return]
 * info     Some info logg!
 * warn     A warning log
 * error    An Error log!
 * info     Add extra params label: ssa
 * error    Prepend error message Ops!!
 *     at Object.<anonymous> (/home/lion/Code/dappnode/DAppNodePackage-dnpinner/build/server/src/logs.ts:59:14)
 *     at Module._compile (internal/modules/cjs/loader.js:701:30)
 *     at Module.m._compile (/home/lion/Code/dappnode/DAppNodePackage-dnpinner/build/server/node_modules/ts-node/src/index.ts:493:23)
 *     at Module._extensions..js (internal/modules/cjs/loader.js:712:10)
 */
const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.errors({ stack: true }),
    format.colorize(),
    // format.simple()
    // format.printf(info => {
    //   console.log(info);
    //   let message = `${info.level} [${info.timestamp}] ${info.stack ||
    //     info.message}`;

    //   return message;
    // })
    format.printf(info => {
      const { level, message, stack, ...others } = info;
      const othersFormated = Object.entries(others)
        .map(([key, value]) => [key, JSON.stringify(value, null, 2)].join(": "))
        .join(" - ");
      return `${info.level.padEnd(5)} ${stack || message} ${othersFormated}`;
    })
  ),
  transports: [new transports.Console()]
});

export default logger;
