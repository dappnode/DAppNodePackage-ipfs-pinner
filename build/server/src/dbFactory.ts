import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

export function dbFactoryBasic(path: string) {
  const adapter = new FileSync(path);
  const db = low(adapter);
  return {
    get: (key: string) => db.get(key).value(),
    set: (key: string, val: any) => db.set(key, val).write(),
    del: (key: string) => {
      db.unset(key).write();
    }
  };
}

export function dbFactory(path: string) {
  const db = dbFactoryBasic(path);

  /**
   * Creates an object of methods for dynamic sub-keys
   * @param rootPath "apm.registry"
   * @param idGetter must return a locally unique id for this source type
   */
  function dynamicSubKeyFactory<T>(
    rootPath: string,
    idGetter: (arg: T) => string
  ) {
    const getPathById = (id: string) => joinPath([rootPath, id]);
    const getPath = (arg: T) => getPathById(idGetter(arg));

    const set = (arg: T): void => db.set(getPath(arg), arg);
    const has = (arg: T): boolean => Boolean(db.get(getPath(arg)));
    const get = (id: string): T => db.get(getPathById(id));
    const getAll = (): T[] => Object.values(db.get(rootPath) || {});
    const del = (id: string): void => db.del(getPathById(id));

    return { set, has, get, getAll, del, getId: idGetter };
  }

  function simpleDynamicSubKeyFactory<T>(rootPath: string) {
    const getPathById = (id: string) => joinPath([rootPath, id]);
    const set = (id: string, arg: T): void => db.set(getPathById(id), arg);
    const get = (id: string): T => db.get(getPathById(id));
    const del = (id: string): void => db.del(getPathById(id));

    return { set, get, del };
  }

  return { dynamicSubKeyFactory, simpleDynamicSubKeyFactory };
}

/**
 * Removes all special characters:
 * @param str "hello world & hello universe"
 * @returns "hello-world-hello-universe"
 */
export function cleanId(str: string): string {
  return str.replace(/[^A-Z0-9]+/gi, "-");
}

export function joinPath(paths: string[]): string {
  return paths.map(cleanId).join(".");
}
