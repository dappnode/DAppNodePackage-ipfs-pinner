/**
 * Parses a line of comma separated values (CSV)
 *
 * @param {stirng} csv "AA,BB, CC  "
 * @returns {array} ["AA", "BB", "CC"]
 */
function parseCsv(csv) {
  return csv
    .trim()
    .split(",")
    .map(s => s.trim())
    .filter(s => s);
}

module.exports = parseCsv;
