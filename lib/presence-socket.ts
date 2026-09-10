import { io, type Socket } from "socket.io-client";

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "https://api.elpino.chat");

/**
 * Connects to the gateway's presence WebSocket for this account. The
 * gateway marks the account "online" for as long as this socket (or any
 * other tab's) stays connected, and "offline" once the last one drops.
 */
export function connectPresenceSocket(userId: string): Socket {
  return io(GATEWAY_URL, {
    query: { userId },
    transports: ["websocket"],
    withCredentials: false,
  });
}
