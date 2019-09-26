import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { merge, omit } from "lodash";
import { DistributedFile, DistributedFilePin } from "./types";

const adapter = new FileSync("pindb.json");
const db = low(adapter);

const apmPath = "apm";

interface PinDb {
  [apmPath]: {
    [packageName: string]: {
      [packageVersion: string]: {
        [fileId: string]: DistributedFilePin;
      };
    };
  };
}

const dbSample: PinDb = {
  [apmPath]: {}
};

/**
 * Sets the "apm" pinDb subsection with a merge
 */
function setApm(file: DistributedFile): void {
  const dbPart: typeof dbSample.apm = db.get(apmPath).value();
  const newDbPart: typeof dbSample.apm = {
    [file.source.name]: {
      [file.source.version]: {
        [file.source.fileId]: { ...omit(file, "source"), added: Date.now() }
      }
    }
  };
  db.set(apmPath, merge(dbPart, newDbPart)).write();
}

export function storeFile(file: DistributedFile): void {
  switch (file.source.from) {
    case "apm":
      setApm(file);
      break;
    default:
      throw Error(`Unknown file source: ${file.source.from}`);
  }
}

export function getFiles(): DistributedFile[] {
  const allFiles: DistributedFile[] = [];
  const allDb: PinDb = db.getState();

  // Fetch from APM files DNP files
  for (const [name, versions] of Object.entries(allDb[apmPath]))
    for (const [version, files] of Object.entries(versions))
      for (const [fileId, file] of Object.entries(files))
        allFiles.push({
          ...file,
          source: { from: apmPath, name, version, fileId }
        });

  return allFiles;
}
