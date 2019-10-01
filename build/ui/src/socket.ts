import io from "socket.io-client";

const apiUrl = `http://localhost:3030`;

const socket = io(apiUrl);

socket.on("connect", () => console.log(`Connected ${apiUrl}`));
socket.on("disconnect", () => console.error(`Disconected ${apiUrl}`));

export default socket;
