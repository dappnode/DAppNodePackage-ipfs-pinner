const secretParamName = "secret";
const multiaddressParamName = "multiaddress";

export function getUrlToShare(secret: string, multiaddress: string) {
  const baseUrl = new URL(window.location.href);
  baseUrl.searchParams.set(secretParamName, secret);
  baseUrl.searchParams.set(multiaddressParamName, multiaddress);
  return baseUrl.toString();
}

export function parseUrlToShare(urlSearch: string) {
  const queryParams = new URLSearchParams(urlSearch);
  const secret = queryParams.get(secretParamName);
  const multiaddress = queryParams.get(multiaddressParamName);
  return { secret, multiaddress };
}

export function getRandomHex(bytes: number) {
  const array = window.crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
