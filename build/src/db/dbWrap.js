/**
 * Wraps a level db instance to provide custom behaviour
 *
 * @param {Object} db level db instance
 */
function wrapDb(db) {
  /**
   * Returns value at key
   * @param {String} key
   */
  function get(key) {
    return db.get(key).catch(err => {
      if (err.message.includes("Key not found")) return null;
      else throw err;
    });
  }

  /**
   * Returns value at key parsed
   * @param {String} key
   */
  function getObj(key) {
    return get(key).then(s => JSON.parse(s || "{}"));
  }

  /**
   * Set value at key
   * @param {String} key
   * @param {*} data
   */
  function set(key, data) {
    return db.put(key, data);
  }

  /**
   * Set value at key after stringifying
   * @param {String} key
   * @param {*} data
   */
  function setObj(key, data) {
    return set(key, JSON.stringify(data));
  }

  async function merge(key, data) {
    const prevData = await getObj(key);
    // Ensure data types
    if (typeof prevData !== "object" || Array.isArray(prevData))
      throw Error(`prevData must be an object: ${JSON.stringify(prevData)}`);
    if (typeof data !== "object" || Array.isArray(data))
      throw Error(`data must be an object: ${JSON.stringify(data)}`);
    return await setObj(key, { ...prevData, ...data });
  }

  function getRangeFromPrefix({ prefix, stripPrefix }) {
    /**
     * [NOTE], to query all possible suffixes to a prefix, query:
     * - from ASCII "+" is 043 (0 is 048)
     * - to   ASCII "~" is 126 (z is 122)
     * Requiring the character range {"+","~"} = {043,126}
     * includes the {0,9} + {A,z} ranges = {048,0122}
     */
    const gte = prefix + "+";
    const lte = prefix + "~";

    return new Promise((resolve, reject) => {
      const items = [];
      db.createReadStream({ gte, lte })
        .on("data", ({ key, value }) => {
          // Remove prefix: "repo-dnp.eth" => "dnp.eth"
          if (stripPrefix) key = key.split(prefix)[1];
          items.push({ key, value });
        })
        .on("error", err => reject(err))
        .on("close", () => resolve(items))
        .on("end", () => resolve(items));
    });
  }

  return {
    get,
    set,
    getObj,
    setObj,
    merge,
    getRangeFromPrefix
  };
}

module.exports = wrapDb;
