import { ArenaRoom, ArenaPlayer, ArenaPlayerResult } from "./arena.service";

/**
 * Industry Standard: Match Event Processor
 * 
 * This service is responsible for the pure business logic of transforming 
 * WebSocket messages into state updates. It decouples the Go backend's
 * protocol from the Frontend's Zustand store.
 */
export class ArenaEventProcessor {
  /**
   * Processes a PLAYER_JOINED event.
   */
  static processPlayerJoined(payload: any, currentRoom: ArenaRoom | null): Partial<any> {
    if (payload?.room) return { room: payload.room };
    
    if (payload?.player && currentRoom) {
      const player = payload.player;
      return {
        room: {
          ...currentRoom,
          players: {
            ...currentRoom.players,
            [player.userId]: player,
          },
        },
      };
    }
    return {};
  }

  /**
   * Processes a PLAYER_LEFT event.
   */
  static processPlayerLeft(payload: any, currentRoom: ArenaRoom | null): Partial<any> {
    if (payload?.room) return { room: payload.room };
    
    if (payload?.userId && currentRoom) {
      const { [payload.userId]: _, ...remainingPlayers } = currentRoom.players;
      return {
        room: { ...currentRoom, players: remainingPlayers },
      };
    }
    return {};
  }

  /**
   * Processes a MATCH_START event.
   */
  static processMatchStarted(payload: any, currentRoom: ArenaRoom | null, currentMatchId: string | null): Partial<any> {
    const matchId = payload?.matchId || payload?.id;
    return {
      room: currentRoom ? { ...currentRoom, ...payload?.room, status: "PLAYING" as any } : payload?.room || null,
      matchId: matchId || currentMatchId,
    };
  }

  /**
   * Processes a PROGRESS_UPDATE event.
   */
  static processProgressUpdate(payload: any, currentRoom: ArenaRoom | null): Partial<any> {
    if (payload?.room) return { room: payload.room };
    
    if (payload?.userId && currentRoom && currentRoom.players[payload.userId]) {
      const { userId, testsPassed, totalTests, score, timeTaken } = payload;
      const updatedPlayers = {
        ...currentRoom.players,
        [userId]: { 
          ...currentRoom.players[userId], 
          testsPassed, 
          totalTests, 
          score,
          timeTaken
        },
      };
      return { room: { ...currentRoom, players: updatedPlayers } };
    }
    return {};
  }

  /**
   * Processes a MATCH_ENDED event.
   */
  static processMatchEnded(payload: any, currentRoom: ArenaRoom | null, storeMatchId: string | null): Partial<any> {
    const finalMatchId = payload?.matchId || storeMatchId;
    const rankings = payload?.finalRankings;

    // [RESILIENCE] Even if matchId is missing, we MUST mark the match as ended
    // if the signal arrived. The results page handles identity recovery via Metadata.
    const updates: any = { 
      matchEnded: true,
      matchId: finalMatchId || null 
    };
    
    if (rankings) updates.finalRankings = rankings;
    
    if (currentRoom) {
      updates.room = { ...currentRoom, status: "FINISHED" as any };
    }

    return updates;
  }

  /**
   * Processes an ERROR event.
   */
  static processError(payload: any): Partial<any> {
    const errorMsg = typeof payload === "string" ? payload : payload?.message || "";
    if (errorMsg.toLowerCase().includes("terminated")) {
      return { room: null };
    }
    return {};
  }
}
