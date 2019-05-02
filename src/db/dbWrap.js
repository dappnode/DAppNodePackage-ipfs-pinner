/**
 * Wraps a level db instance to provide custom behaviour
 *
 * @param {Object} db level db instance
 */
function wrapDb(db) {
  /**
   * Returns value at key parsed
   * @param {String} key
   */
  function get(key) {
    return db.get(key).catch(err => {
      if (err.message.includes("Key not found")) return null;
      else throw err;
    });
  }

  /**
   * Set value at key after stringifying
   * @param {String} key
   * @param {*} data
   */
  function set(key, data) {
    return db.put(key, data);
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
    getRangeFromPrefix
  };
}

module.exports = wrapDb;
