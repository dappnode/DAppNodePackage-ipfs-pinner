import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

export default function dbFactory(path: string) {
  const adapter = new FileSync(path);
  const db = low(adapter);
  return {
    get: (key: string) => db.get(key).value(),
    set: (key: string, val: any) => db.set(key, val).write(),
    del: (key: string) => db.unset(key).write()
  };
}
