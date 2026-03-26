import { io } from "socket.io-client";
const rawUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const SOCKET_URL = new URL(rawUrl).origin;

const socket = io(SOCKET_URL, {
	autoConnect: false,
	withCredentials: true,
	transports: ["websocket", "polling"],
});

export default socket;
