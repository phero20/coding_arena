import { redis } from "./redis";

/**
 * Arena-specific Redis Pub/Sub channels and event publishers.
 * Coordinates communication between API, Go Hub, and Frontend.
 */

/**
 * Channel: arena:room:updates
 * Events: PLAYER_REMOVED, MATCH_ENDED, HOST_TRANSFERRED
 * Subscribers: Go Hub (broadcasts to WebSocket clients)
 */
export async function publishPlayerRemoved(
  roomId: string,
  userId: string
): Promise<void> {
  await redis.publish(
    "arena:room:updates",
    JSON.stringify({
      type: "PLAYER_REMOVED",
      roomId,
      userId,
      timestamp: new Date().toISOString(),
    })
  );
}

export async function publishMatchEnded(
  roomId: string,
  finalRankings: any[]
): Promise<void> {
  await redis.publish(
    "arena:room:updates",
    JSON.stringify({
      type: "MATCH_ENDED",
      roomId,
      finalRankings,
      timestamp: new Date().toISOString(),
    })
  );
}

export async function publishHostTransferred(
  roomId: string,
  newHostId: string
): Promise<void> {
  await redis.publish(
    "arena:room:updates",
    JSON.stringify({
      type: "HOST_TRANSFERRED",
      roomId,
      newHostId,
      timestamp: new Date().toISOString(),
    })
  );
}

/**
 * Channel: arena:submission:created
 * Events: PLAYER_SUBMITTED (code submission)
 * Subscribers: Go Hub (broadcasts to WebSocket clients)
 */
export async function publishPlayerSubmitted(
  roomId: string,
  userId: string,
  submissionOrder: number,
  submissionId: string
): Promise<void> {
  await redis.publish(
    "arena:submission:created",
    JSON.stringify({
      type: "PLAYER_SUBMITTED",
      roomId,
      userId,
      submissionOrder,
      submissionId,
      timestamp: new Date().toISOString(),
    })
  );
}

/**
 * Channel: arena:submission:completed
 * Events: SUBMISSION_EVALUATED (after worker finishes evaluation)
 * Subscribers: Go Hub (calculates leaderboard, broadcasts LEADERBOARD_UPDATE)
 */
export async function publishSubmissionEvaluated(
  roomId: string,
  userId: string,
  submissionOrder: number,
  verdict: string,
  score: number,
  executionTime: number,
  leaderboard?: any[]
): Promise<void> {
  await redis.publish(
    "arena:submission:completed",
    JSON.stringify({
      type: "SUBMISSION_EVALUATED",
      roomId,
      userId,
      submissionOrder,
      verdict,
      score,
      executionTime,
      leaderboard: leaderboard || [],
      timestamp: new Date().toISOString(),
    })
  );
}

export async function publishArenaUpdate(roomId: string, payload: any): Promise<void> {
  await redis.publish(
    "arena:room:updates",
    JSON.stringify({
      roomId,
      ...payload,
      timestamp: new Date().toISOString(),
    })
  );
}

/**
 * Channel: arena:match:started
 * Events: MATCH_STARTED (when match transitions from WAITING to PLAYING)
 * Subscribers: Go Hub (broadcasts to WebSocket clients)
 */
export async function publishMatchStarted(
  roomId: string,
  players: string[],
  matchId: string
): Promise<void> {
  await redis.publish(
    "arena:room:updates",
    JSON.stringify({
      type: "MATCH_STARTED",
      roomId,
      payload: {
        matchId,
        playerCount: players.length,
        players,
      },
      timestamp: new Date().toISOString(),
    })
  );
}


