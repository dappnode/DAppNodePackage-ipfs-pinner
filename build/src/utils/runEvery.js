const timestring = require("timestring");

/**
 * Runs every interval, and resolves after the first immediate run
 * @param {string} interval
 * @param {function} fn
 */
async function runEvery(interval, fn) {
  const wrappedFn = wrapErrors(fn);
  const intervalMs = parseInterval(interval);
  let lastRun = Date.now();
  await wrappedFn();
  scheduleRun();

  function scheduleRun() {
    setTimeout(async () => {
      lastRun = Date.now();
      await wrappedFn();
      scheduleRun();
    }, minZero(lastRun + intervalMs - Date.now()));
  }
}

// Utils

/**
 * Force negative values to be 0
 * @param {number} num
 */
const minZero = num => (num < 0 ? 0 : num);

/**
 * Parse a time declaration if string.
 * If number, assume it's ms
 *
 * @param {string|number} numOrString "15m"
 * parsed by https://www.npmjs.com/package/timestring
 */
function parseInterval(interval) {
  switch (typeof interval) {
    case "string":
      return parseInt(timestring(interval, "ms"));
    case "number":
      return interval;
    default:
      throw Error(
        `Unknown interval type, must be a string or number: ${interval}`
      );
  }
}

/**
 * Warp errors
 */
const wrapErrors = fn => async () => {
  try {
    return await fn();
  } catch (e) {
    console.error(e.stack);
  }
};

module.exports = runEvery;
