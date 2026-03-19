import { ArenaWSMessage } from "./arena.service";
import { useArenaStore } from "@/store/useArenaStore";
import { useEditorStore } from "@/store/match-store/use-editor-store";

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
      console.log("[Arena Socket] Connected to Go Worker");
      const store = useArenaStore.getState();
      store.setIsConnected(true);
      store.setSocket(this.socket);
      store.setError(null);
    };

    this.socket.onmessage = (event) => {
      try {
        const message: ArenaWSMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (err) {
        console.error("[Arena Socket] Message Parse Error:", err);
      }
    };

    this.socket.onclose = () => {
      console.log("[Arena Socket] Connection Closed");
      useArenaStore.getState().setIsConnected(false);
      this.attemptReconnect();
    };

    this.socket.onerror = (err) => {
      console.error("[Arena Socket] Error:", err);
      useArenaStore.getState().setError("Real-time connection failed");
    };
  }

  /**
   * Handle incoming messages and dispatch to Zustand Store.
   */
  private handleMessage(message: ArenaWSMessage) {
    const { setRoom, updatePlayer, updateRoom, setLeaderboard, setMatchEnded, removePlayer, setUserRemoved, setHostTransferred } = useArenaStore.getState();

    switch (message.type) {
      case "PLAYER_JOINED":
      case "PLAYER_LEFT":
      case "PLAYER_READY":
      case "PROBLEM_CHANGED":
      case "MATCH_STARTED":
      case "PROGRESS_UPDATE":
      case "MATCH_SUBMITTED":
        // Go server sends the updated room in the payload
        if (message.payload?.room) {
          setRoom(message.payload.room);
        }
        break;

      case "PLAYER_REMOVED":
        if (message.payload?.userId) {
          const removedUserId = message.payload.userId;
          if (removedUserId === this.userId) {
            setUserRemoved(true, message.payload.reason || "You were removed from the room");
          } else {
            removePlayer(removedUserId);
          }
        }
        break;

      case "LEADERBOARD_UPDATE":
        if (message.payload?.leaderboard) {
          setLeaderboard(message.payload.leaderboard);
        }
        break;

      case "MATCH_ENDED":
      case "MATCH_OVER":
        if (message.payload?.finalRankings) {
          setMatchEnded(true, message.payload.finalRankings);
        }
        break;

      case "HOST_TRANSFERRED":
        if (message.payload?.newHostId) {
          setHostTransferred(true, message.payload.newHostId);
        }
        break;

      case "ERROR":
        const terminal =
          typeof message.payload === "string" &&
          message.payload.includes("terminated");
        if (terminal) {
          useArenaStore.getState().setRoom(null);
        }
        useArenaStore.getState().setError(message.payload);
        break;
    }
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
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.onclose = null; // Prevent reconnect loop
      this.socket.close();
    }
    const store = useArenaStore.getState();
    store.reset();
    store.setSocket(null);
  }
}
