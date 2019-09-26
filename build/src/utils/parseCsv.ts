/**
 * Parses a line of comma separated values (CSV)
 *
 * @param {stirng} csv "AA,BB, CC  "
 * @returns {array} ["AA", "BB", "CC"]
 */
export default function parseCsv(csv: string): string[] {
  return csv
    .trim()
    .split(",")
    .map(s => s.trim())
    .filter(s => s);
}
