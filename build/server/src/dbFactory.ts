import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
export function dbFactoryBasic(path: string) {
  const adapter = new FileSync(path);
  const db = low(adapter);
  return {
    get: <R>(key: string): R => db.get(key).value(),
    set: <T>(key: string, val: T): void => db.set(key, val).write(),
    del: (key: string): void => {
      db.unset(key).write();
    }
  };
}

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
export function dbFactory(path: string) {
  const db = dbFactoryBasic(path);

  /**
   * Creates an object of methods for dynamic sub-keys
   * @param rootPath "apm.registry"
   * @param idGetter must return a locally unique id for this source type
   */
  /* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
  function dynamicSubKeyFactory<T>(
    rootPath: string,
    idGetter: (arg: T) => string
  ) {
    const getPathById = (id: string): string => joinPath([rootPath, id]);
    const getPath = (arg: T): string => getPathById(idGetter(arg));

    const set = (arg: T): void => db.set(getPath(arg), arg);
    const has = (arg: T): boolean => Boolean(db.get(getPath(arg)));
    const get = (id: string): T => db.get(getPathById(id));
    const getAll = (): T[] => Object.values(db.get(rootPath) || {});
    const del = (id: string): void => db.del(getPathById(id));

    return { set, has, get, getAll, del, getId: idGetter };
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
  function simpleDynamicSubKeyFactory<T>(rootPath: string) {
    const getPathById = (id: string): string => joinPath([rootPath, id]);
    const set = (id: string, arg: T): void => db.set(getPathById(id), arg);
    const get = (id: string): T => db.get(getPathById(id));
    const del = (id: string): void => db.del(getPathById(id));

    return { set, get, del };
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
  function simpleKeyFactory<T>(rootPath: string) {
    const set = (arg: T): void => db.set(rootPath, arg);
    const get = (): T | undefined => db.get(rootPath);
    const del = (): void => db.del(rootPath);

    return { set, get, del };
  }

  return { dynamicSubKeyFactory, simpleDynamicSubKeyFactory, simpleKeyFactory };
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
