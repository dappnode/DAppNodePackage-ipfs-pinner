import { SourceType, SourcesApi, AssetsApi, SourceOptionsApi } from "./types";

const apiUrl = `http://localhost:3001`;

export async function addSourceByType(
  type: SourceType,
  name: string
): Promise<any> {
  if (!type) throw Error("Arg type must be defined");
  if (!name) throw Error("Arg name must be defined");
  console.log(`Adding source`, { type, name });

  const res = await fetch(`${apiUrl}/sources`, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, name })
  });
  if (!res.ok) {
    console.log(await res.text());
  }
  return await res.json(); // parses JSON response into native JavaScript objects
}

export async function fetchAssets(): Promise<AssetsApi> {
  return await fetch(`${apiUrl}/assets`).then(res => res.json());
}

export async function fetchSources(): Promise<SourcesApi> {
  return await fetch(`${apiUrl}/sources`).then(res => res.json());
}

export async function fetchSourceOptions(): Promise<SourceOptionsApi> {
  return await fetch(`${apiUrl}/sources/options`).then(res => res.json());
}
