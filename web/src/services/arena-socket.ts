import { ArenaWSMessage } from "./arena.service";
import { useArenaStore } from "@/store/useArenaStore";
import { useEditorStore } from "@/store/use-editor-store";

/**
 * Manager for High-Performance Go WebSocket Connections.
 * Handles authentication, heartbeats, and state synchronization.
 */
export class ArenaSocketManager {
  private socket: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private roomId: string;
  private userId: string;
  private token: string;
  private username: string;
  private avatarUrl?: string;

  constructor(
    roomId: string,
    userId: string,
    token: string,
    username: string,
    avatarUrl?: string,
  ) {
    this.roomId = roomId;
    this.userId = userId;
    this.token = token;
    this.username = username;
    this.avatarUrl = avatarUrl;
  }

  public getRoomId() {
    return this.roomId;
  }

  /**
   * Initialize the connection to the Go Microservice.
   */
  connect() {
    // 1. Build Secure URL (Go worker on 8080)
    const baseUri =
      process.env.NEXT_PUBLIC_ARENA_WS_URL || "ws://localhost:8080";
    const url = new URL(`${baseUri}/arena/ws/${this.roomId}`);

    // Auth and User Identity via Query Params
    url.searchParams.set("token", this.token);
    url.searchParams.set("userId", this.userId);
    url.searchParams.set("username", this.username);
    if (this.avatarUrl) url.searchParams.set("avatarUrl", this.avatarUrl);

    this.socket = new WebSocket(url.toString());

    this.socket.onopen = () => {
      console.log(`[Arena Socket] Joined Room: ${this.roomId}`);
      const store = useArenaStore.getState();
      store.setIsConnected(true);
      store.setSocket(this.socket);
    };

    this.socket.onmessage = (event) => {
      try {
        const message: ArenaWSMessage = JSON.parse(event.data);
        useArenaStore.getState().syncWebSocketState(message, this.roomId);
      } catch (err) {
        console.error("[Arena Socket] Malformed Message:", err);
      }
    };

    this.socket.onclose = (event) => {
      const isClean = event.wasClean;
      console.log(
        `[Arena Socket] Closed (Clean: ${isClean}, Code: ${event.code})`,
      );
      useArenaStore.getState().setIsConnected(false);

      // Don't reconnect if the room was intentionally left, terminated, or match ended
      // 4004 = Backend intentionally rejected connection (e.g., room deleted/doesn't exist)
      if (
        event.code !== 1000 &&
        event.code !== 1001 &&
        event.code !== 4004 &&
        !useArenaStore.getState().matchEnded
      ) {
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (err: any) => {
      console.error("[Arena Socket] Transport Error:", err);
    };
  }

  /**
   * Send a signed message to the Go Backend.
   */
  send(type: ArenaWSMessage["type"], payload: any = {}) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    }
  }

  private attemptReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      console.log("[Arena Socket] Attempting Reconnect...");
      this.connect();
    }, 3000);
  }

  disconnect() {
    // 1. Kill any pending reconnect timers immediately
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // 2. Neutralize the socket BEFORE closing
    // This prevents the 'onclose' or 'onerror' handlers from firing during teardown
    if (this.socket) {
      console.log(`[Arena Socket] Hard Teardown for room: ${this.roomId}`);
      this.socket.onclose = null; 
      this.socket.onerror = null;
      this.socket.onmessage = null;
      this.socket.onopen = null;
      
      // Only close if it's not already closed
      if (this.socket.readyState !== WebSocket.CLOSED && this.socket.readyState !== WebSocket.CLOSING) {
        this.socket.close();
      }
      this.socket = null;
    }

    // 3. Clear Store references
    const store = useArenaStore.getState();
    store.setIsConnected(false);
    store.setSocket(null);
  }
}
