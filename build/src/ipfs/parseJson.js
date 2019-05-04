function parseJson(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error on JSON.parse (see error below). Raw data: \n${data}`);
    console.error(e.stack);
  }
}

module.exports = parseJson;
