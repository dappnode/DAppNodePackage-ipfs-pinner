const db = require("./db");
const registry = require("./registry");

start();

async function start() {
  await db.addRegistry({
    name: "dnp.dappnode.eth",
    address: "0x266bfdb2124a68beb6769dc887bd655f78778923"
  });
  await registry();
}
