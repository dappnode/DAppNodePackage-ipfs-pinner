/**
 * Calls the async function `fn` on each array item in paralel
 *
 * @param {function} fn async function
 * @param {function} getIdForError function to format the error messages
 */
Object.defineProperty(Array.prototype, "mapAsyncParallel", {
  value: function mapAsyncParallel(fn) {
    return Promise.all(this.map(item => fn(item)));
  }
});
