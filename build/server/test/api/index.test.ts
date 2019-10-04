import IoClient from "socket.io-client";
import http from "http";
import { expect } from "chai";
import runHttpApi from "../../src/api";

const port = 3033;
const socketUrl: string = `http://localhost:${port}`;
// const options: SocketIOClient.ConnectOpts = {
//   transports: ["websocket"],
//   "force new connection": true
// };

describe("Server", () => {
  describe("Socket", () => {
    let server: http.Server;

    beforeEach(() => {
      server = runHttpApi(3030);
    });

    it("OMG!", done => {
      const socket = IoClient(socketUrl);
      console.log(socket);
      socket.on("connect", function() {
        console.log("Conected!");
      });
    });

    afterEach(() => {
      server.close();
      // client.close();
    });

    // more tests coming...
  });
});
