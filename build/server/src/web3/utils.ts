import { ethers } from "ethers";

export function hexToUtf8(hexString: string) {
  try {
    return ethers.utils.toUtf8String(hexString);
  } catch (e) {
    try {
      return hex2ascii(hexString);
    } catch {
      throw Error(`can't convert hexString to utf8 ${hexString}: ${e.message}`);
    }
  }
}

/**
 * Fallback for UTF8 conversion
 * Credit: https://github.com/miguelmota/hex2ascii
 */
function hex2ascii(hex: string) {
  if (typeof hex !== "number" && typeof hex !== "string") return "";

  hex = hex.toString().replace(/\s+/gi, "");
  const stack = [];

  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16);
    if (!isNaN(code) && code !== 0) stack.push(String.fromCharCode(code));
  }

  return stack.join("");
}
