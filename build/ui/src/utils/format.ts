export function shortName(ens: string) {
  if (!ens || typeof ens !== "string") return ens;
  if (!ens.includes(".")) return ens;
  return ens.split(".")[0];
}

export const capitalize = (s: string) => {
  if (!s || typeof s !== "string") return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export function shortNameCapitalized(name: string) {
  if (!name || typeof name !== "string") return name;
  let _name = shortName(name)
    // Convert all "-" and "_" to spaces
    .replace(new RegExp("-", "g"), " ")
    .replace(new RegExp("_", "g"), " ")
    .split(" ")
    .map(capitalize)
    .join(" ");

  return _name.charAt(0).toUpperCase() + _name.slice(1);
}

export function prettyRepoEns(ensName: string) {
  if (!ensName) return ensName;
  if (ensName.includes(".dnp.dappnode.eth"))
    return ensName.split(".dnp.dappnode.eth")[0];
  if (ensName.includes(".public.dappnode.eth"))
    return ensName.split(".dappnode.eth")[0];
}
