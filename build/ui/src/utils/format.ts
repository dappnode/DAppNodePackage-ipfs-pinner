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
  const _name = shortName(name)
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
  let [shortName, ...registryArr] = ensName.split(".");
  registryArr = registryArr.filter(s => s !== "eth");

  const prettyShortName = shortNameCapitalized(shortName);
  return registryArr.length
    ? `${prettyShortName} (${registryArr
        .map(shortNameCapitalized)
        .reverse()
        .join(" ")})`
    : prettyShortName;
}

export function prettyRegistryEns(ensName: string) {
  if (!ensName) return ensName;
  let registryArr = ensName.split(".");
  registryArr = registryArr.filter(s => s !== "eth");

  return registryArr
    .map(shortNameCapitalized)
    .reverse()
    .join(" ");
}

export function prettyType(type: string) {
  if (!type || typeof type !== "string") return type;
  return capitalize(type.replace(new RegExp("-", "g"), " "));
}

export function ellipseText(s: string, n: number): string {
  if (!s || typeof s !== "string") return s;
  if (s.length >= n) return s.slice(0, n) + "...";
  else return s;
}
