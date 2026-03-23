import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5001");
const SOCKET_URL = API_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
});
