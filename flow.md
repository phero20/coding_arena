# Arena Flow: 50-Player Multiplayer Competitive Coding

## Executive Summary
Transform aria from 3-player restricted arena to scalable 50-player competitive platform with:
- **Problem:** 50 players submitting code continuously via WebSocket = 50 updates/sec = network/server overload
- **Solution:** Server-side code storage + metadata-only WebSocket (submission events only)
- **Ranking:** Real-time leaderboard based on submission timestamp (no code resending)
- **Match End:** When only 1 player remains (users_count - 1 eliminations)

---

## Phase 1: Database Schema Expansion (Step 1-3)

### Step 1: Extend Arena Match Schema
```
Collection: arena_matches
{
  _id: ObjectId
  hostId: string (creator)
  problemId: string
  status: 'waiting' | 'in_progress' | 'completed'
  maxPlayers: number (50)
  currentPlayerCount: number
  createdAt: Date
  startedAt: Date | null
  endedAt: Date | null
  winner: ObjectId (userId) | null
  
  // NEW FIELDS
  players: [
    {
      userId: ObjectId
      username: string
      joinedAt: Date
      status: 'joined' | 'coding' | 'submitted' | 'eliminated' | 'winner'
      submissionTime: Date | null (server timestamp when submitted)
      verdict: 'pending' | 'accepted' | 'wrong_answer' | 'runtime_error' | 'compilation_error'
      rank: number | null (final rank 1, 2, 3...)
      score: number (based on submission order: first=100, second=90, etc)
    }
  ]
  
  finalRankings: [
    {
      rank: 1
      userId: ObjectId
      username: string
      submissionTime: Date
      verdict: string
    }
  ]
  
  removedPlayersLog: [
    {
      userId: ObjectId
      username: string
      removedBy: ObjectId (host)
      removedAt: Date
      reason: string
    }
  ]
}
```

### Step 2: Create Arena Session Redis Cache
```
Redis Key Pattern: arena:match:{matchId}

Data Stored:
- arena:match:{matchId}:players -> Set of active playerIds
- arena:match:{matchId}:code:{userId} -> Latest code submission (player)
- arena:match:{matchId}:lastUpdate -> Timestamp
- arena:match:{matchId}:submissions -> Sorted Set (score=submissionTime, member=userId)

TTL: Match expiry or manual cleanup on endMatch()
```

### Step 3: Extend Submission Schema
```
Collection: submissions
{
  // EXISTING FIELDS...
  
  // NEW FIELDS for arena context
  arenaMatchId: ObjectId | null
  submissionOrder: number | null (1st, 2nd, 3rd in match)
  competitionRank: number | null (1=winner, 2=runner-up)
  isCompetitionWinning: boolean (was this final verdict?)
}
```

---

## Phase 2: Backend Arena Services (Step 4-8)

### Step 4: Create ArenaMatch Management Service
**File:** `api/src/services/arena-match.service.ts`

Features:
- createMatch() - Initialize 50-player match (host only)
- joinMatch(matchId, userId) - Add player to arena (max 50)
- removePlayerBeforeStart(matchId, userId, hostId) - Host can remove before START
- startMatch(matchId, hostId) - Lock players, start timer
- getMatchPlayers(matchId) - Return all players with current status
- getMatchStatus(matchId) - Return live leaderboard state

### Step 5: Create Code Storage Strategy (NO WebSocket Code Transmission)
**Decision:** Store code server-side in Redis

Logic:
```
1. Player submits code via `/submissions/submit`
2. Code stored in: Redis `arena:match:{matchId}:code:{userId}`
3. BullMQ Worker processes code + test cases
4. WebSocket broadcasts ONLY: { userId, verdict, submissionOrder, timestamp }
5. Never send code via WebSocket (saves bandwidth 50x)
6. UI fetches code only on demand (view opponent code after match)
```

Benefits:
- 50 players × 100 updates/sec = 5000 messages → reduced to 50 (metadata only)
- Bandwidth reduction: 95%
- No race conditions with concurrent code updates

### Step 6: Create Submission Handler for Arena Context
**File:** `api/src/controllers/arena-submission.controller.ts`

Endpoints:
```
POST /arena/{matchId}/submit
- Body: { code, language, problemId }
- Returns: { submissionId, status: 'queued' }
- Stores code in Redis (not sent via WebSocket)
- Adds entry to submission queue
- Triggers WebSocket event (metadata only)

GET /arena/{matchId}/leaderboard
- Returns: Live ranking with timestamps
- { userId, username, verdict, submissionTime, rank }

GET /arena/{matchId}/code/{userId}
- Standalone fetch after match (audit/learning)
```

### Step 7: Implement Match State Machine via BullMQ
**File:** `api/src/workers/arena-match.worker.ts`

Jobs:
```
Job Type 1: ProcessArenaSubmission
- Input: { matchId, userId, code, problem }
- Execution: Run tests, get verdict
- Output: Update Redis + DB with results
- Publish: WebSocket { userId, verdict, timestamp, submissionOrder }
- Side Effect: Check if only 1 player left (others eliminated)

Job Type 2: CheckMatchCompletion
- Runs every 5 seconds during active match
- Counts players with status='submitted' AND verdict='accepted'
- If count = players-1 (only 1 player left): endMatch()
- Transition: status 'in_progress' → 'completed'

Job Type 3: EndMatch
- Finalize rankings, store in DB
- Calculate scores: 1st=100, 2nd=90, 3rd=80... (decreasing)
- Update player.rank + finalRankings array
- Archive results
- Publish: WebSocket { matchComplete, winner, rankings }
```

### Step 8: Create WebSocket Events Schema
**Events (NOT code transmission):**

BroadcastToMatch:
```
{
  type: 'player_joined',
  data: { userId, username, playerCount }
}

{
  type: 'player_removed',
  data: { userId, username, removedBy, playerCount }
}

{
  type: 'match_started',
  data: { timestamp }
}

{
  type: 'submission_received',
  data: { 
    userId, 
    username,
    submissionOrder, // 1, 2, 3...
    timestamp,
    verdict // 'accepted' or 'wrong_answer' or 'runtime_error'
  }
}

{
  type: 'player_eliminated',
  data: { 
    userId, 
    verdict, 
    remainingPlayers: 5 
  }
}

{
  type: 'match_completed',
  data: {
    winner: { userId, username },
    finalRankings: [
      { rank: 1, userId, username, score: 100 },
      { rank: 2, userId, username, score: 90 }
    ]
  }
}
```

---

## Phase 3: Frontend Arena UI Components (Step 9-13)

### Step 9: Create Arena Lobby Component
**File:** `web/src/components/arena/ArenaLobby.tsx`

Features:
- Display: "X/50 Players Joined"
- Show player list (join/remove buttons for host only)
- Host-only button: "Start Match" (lock in players)
- Show problem details while waiting
- Countdown timer "Match starts in 10s"

### Step 10: Create Arena Workspace During Match
**File:** `web/src/components/arena/ArenaWorkspace.tsx`

Layout:
- Left: Code editor (dark theme, full height)
- Right (3 sections):
  1. **Leaderboard:** Live ranking (updates on each submission)
     ```
     Rank | Player | Verdict | Time Elapsed
     1    | User1  | ✅ AC   | 00:32
     2    | User2  | ❌ WA   | 00:45
     3    | User3  | ⏳ ...  | -
     ```
  2. **Problem:** Read-only problem statement
  3. **Test Results:** Your submission results only (not others')

### Step 11: Create Live Leaderboard Hook
**File:** `web/src/hooks/useArenaLeaderboard.ts`

```typescript
- Listen to WebSocket events (submission_received, player_eliminated)
- Maintain local state: players array sorted by submissionTime
- Auto-update rank numbers
- Highlight current user
- Show "Match Complete" overlay when event arrives
- Re-rank based on verdict (wrong_answer = elimination)
```

### Step 12: Create Arena Submission Handler (Different from Solo)
**File:** `web/src/hooks/useArenaSubmit.ts`

Logic:
```
1. User clicks "Submit"
2. POST /arena/{matchId}/submit { code, language }
3. Response: { submissionId, status: 'queued' }
4. Immediately disable submit button (one per match)
5. Listen for WebSocket submission_received event
6. Display verdict + update leaderboard
7. Show "Waiting for others" message
8. When match_completed arrives: show final rankings
```

**Key Difference from Solo:**
- User can only submit ONCE per match
- Cannot re-submit (no "Try Again" button)
- Verdict depends on: first correct = winner, anything else = eliminated

### Step 13: Create Match Results Screen
**File:** `web/src/components/arena/ArenaResults.tsx`

Display:
- 🏆 Winner badge for rank 1
- Full leaderboard with final scores
- Buttons:
  - "View Match Replay" (watch all submissions in timeline)
  - "Download Results" (JSON export)
  - "Join Another Match" 

---

## Phase 4: Host & Match Control Features (Step 14-16)

### Step 14: Implement Host Controls (Before Match Start)
**Endpoints:**

```
POST /arena/{matchId}/remove-player
- Body: { playerUserId }
- Auth: Only match host
- Effect: Remove from players array, trigger WebSocket event
- Return: Updated player list

GET /arena/{matchId}/settings (host only)
- Return: maxPlayers, allowSpectators, timerRules, etc
- Allow edit before START
```

### Step 15: Implement Player Removal UI
**Component:** `web/src/components/arena/PlayerList.tsx`

For Host:
- Show all players with ⊗ (remove button) if match status = 'waiting'
- Confirmation: "Remove {name}? This cannot be undone."
- After removal: WebSocket fires, updates all clients

For Players:
- Show read-only list (no remove buttons)
- Cannot see host controls

### Step 16: Implement Match Timer & Auto-Termination
**Logic:**

```
Frontend Timer:
- Display countdown in Workspace: "00:45:32 remaining"
- Rules: 
  - Soft limit: 2 hours (warning at 5 min remaining)
  - Hard limit: 3 hours (auto-end match)
  
Backend Auto-Termination:
- Set TTL on Redis match keys (3 hours)
- Job: CheckMatchTimeout every 30 min
- On timeout: Call endMatch(), crown highest scorer as winner
```

---

## Phase 5: Database Result Storage (Step 17-19)

### Step 17: Implement Match Completion Logic
**Worker: arena-match.worker.ts > EndMatch job**

```typescript
async function endMatch(matchId) {
  1. Query Redis: arenaMatch:matchId:submissions (sorted set)
  2. Calculate final rankings:
     - Sort by submissionTime ASC (earliest first)
     - Assign rank: 1, 2, 3... based on order of correct submissions
     - Calculate score: 1st=100, 2nd=90, 3rd=80, etc.
  
  3. Update MongoDB arena_matches:
     - Set status: 'completed'
     - Set endedAt: Date.now()
     - Set winner: topRankedUserId
     - Set finalRankings: [...] array
     - Set winner badge/achievement
  
  4. Update individual submissions (for audit):
     - Set arenaMatchId: matchId
     - Set submissionOrder: rank
     - Set competitionRank: rank
  
  5. Award XP/Points:
     - Winner: 500 XP + badge
     - 2nd place: 300 XP
     - 3rd place: 150 XP
     - Other submitted: 50 XP each
  
  6. Update user profiles:
     - Increment matches_played
     - Update matches_won (if winner)
     - Calculate win_rate = wins / matches
  
  7. Cleanup Redis:
     - Delete arena:match:{matchId}:* keys
     - Keep data only in MongoDB
}
```

### Step 18: Create Admin Dashboard Query Endpoints
**Endpoints:**

```
GET /admin/arena/matches?limit=100&sort=createdAt
- Return: List of all matches with duration, participant count, winner

GET /admin/arena/matches/{matchId}/details
- Return: Full match data including all submissions with timestamps

GET /admin/arena/leaderboard?timeframe=week|month|all
- Return: Top 100 players ranked by win_rate, matches_won
- Include: username, avatar, wins, losses, winrate, totalXP
```

### Step 19: Create Player Stats Aggregation
**File:** `api/src/services/arena-stats.service.ts`

Queries:
```
getPlayerStats(userId)
- totalMatches: count
- wonMatches: count
- placement1: count
- placement2: count
- placement3: count
- avgRank: average placement
- winRate: %
- totalXP: sum
- streak: current win streak
- bestStreak: historic win streak

getPlayerMatchHistory(userId, limit=20)
- Return: Last 20 matches with: date, placement, opponent count, XP earned

getRanking(userId)
- Return: { rank: 47, percentile: 85 }
```

---

## Phase 6: Real-Time Optimizations (Step 20-22)

### Step 20: Implement Broadcast Throttling
**Problem:** 50 leaderboard updates per second = too many WebSocket messages

**Solution:**
```typescript
// Backend: Batch updates
const leaderboardUpdateQueue = []

// When submission arrives:
leaderboardUpdateQueue.push({ userId, verdict, timestamp })

// Every 200ms (not per event):
setInterval(() => {
  if (leaderboardUpdateQueue.length > 0) {
    broadcast(socket, 'leaderboard_batch_update', leaderboardUpdateQueue)
    leaderboardUpdateQueue = []
  }
}, 200)
```

Benefits:
- 50 events/sec → 5 batches/sec (90% reduction)
- Frontend still feels real-time (200ms latency imperceptible)

### Step 21: Implement Client-Side Optimistic Updates
**Hook: useArenaLeaderboard.ts**

```typescript
// Instant feedback without waiting for server
1. User submits → immediately set local state: verdict='pending'
2. Show skeleton loader on leaderboard: "Processing..."
3. On WebSocket event: Confirm verdict + update timestamp
4. If mismatch (e.g., pending showed but received error): Animate correction

This prevents "frozen" UI while server processes
```

### Step 22: Implement Spectator Mode (Optional)
**For Future:**
```
POST /arena/{matchId}/spectate
- Join as observer (doesn't participate)
- Can view leaderboard in real-time
- Cannot submit code
- Useful for tournaments/streaming
```

---

## Phase 7: Testing & Stress Testing (Step 23-25)

### Step 23: Load Test: 50 Players One Match
**File:** `testings/arena-load-test.js` (new)

```javascript
// Scenario: 50 players join, all submit code simultaneously

Stages:
1. Ramp: 0→50 players joining over 10s
2. Wait: All in lobby for 5s
3. Match start: Host clicks start, match begins
4. Submit: All 50 submit code within 2s of each other
5. Results: All receive match_completed event
6. Ramp down: 10s

Checks:
- All joined successfully ✓
- Match started with 50 players ✓
- All submissions processed (none dropped) ✓
- Leaderboard received 201 updates in < 10s ✓
- No WebSocket disconnections ✓
- Final rankings stored in DB ✓
```

### Step 24: Create Arena Integration Test Suite
**Files:** `api/tests/arena.integration.test.ts`

Tests:
```
✓ Create match with 50 max players
✓ Join 50 players to same match
✓ Host removes player before start (check removal event)
✓ Start match (players locked)
✓ Player cannot join after start
✓ Player submits code (stored in Redis, not sent via WS)
✓ Leaderboard updates on submission
✓ Second player submission: rank 2 assigned
✓ Only 1 player correct: match ends, rank=1
✓ Final rankings stored in DB
✓ Player stats updated with XP
✓ Match history queryable
✓ Cannot submit twice
✓ Match TTL cleanup after 3 hours
```

### Step 25: Create UI Load Test (React)
**File:** `testings/arena-ui-load.test.tsx`

Tests:
```
✓ Render 50 players in leaderboard (no lag)
✓ Update leaderboard 10x/sec (animations smooth)
✓ Rapid verdict updates (pending→accepted) don't flicker
✓ Opponent code view loads in < 500ms
✓ Match results calculate in < 1s
```

---

## Implementation Critical Points

### ✅ WebSocket Optimization (Solves 50-User Problem)
| Metric | Without Optimization | With Optimization |
|--------|---------------------|-------------------|
| Messages/sec | 2500 | 50 |
| Bandwidth/sec | 5MB | 50KB |
| Server CPU | 45% | 8% |
| Leaderboard Latency | Real-time | 200ms (imperceptible) |

**Decision: NEVER send code via WebSocket. Store in Redis, send metadata only.**

### ✅ Match End Condition
```
Match ends when:
1. Only 1 player has correct verdict (everyone else wrong/pending)
2. OR 3 hours elapsed (hard limit)

Example:
- 50 players join
- User A submits correct at 00:45 → rank 1
- Users B-D submit wrong → eliminated
- User E submits correct at 01:23 → rank 2
- Still 45 pending... wait or end?

RULE: If someone submitted correct, they WIN. Others eliminated or waiting.
If 2+ correct: First correct = rank 1, second correct = rank 2, etc.
```

### ✅ Ranking Algorithm
```
1. Filter players with verdict = 'accepted' (correct)
2. Sort by submissionTime ASC (earliest first)
3. Assign rank 1, 2, 3...
4. Assign score: 100 - (rank-1)*10 (1st=100, 2nd=90, 3rd=80...)
5. XP = score * multiplier (based on difficulty)

Example: 50 players, 5 correct
- User A: submitted 00:32 → Rank 1, XP=500
- User B: submitted 00:45 → Rank 2, XP=450
- User C: submitted 01:12 → Rank 3, XP=400
- User D: submitted wrong → Rank -, XP=50
```

### ✅ Host Control Restrictions
```
Before Match START:
- Host can remove players ✓
- Host can change settings ✓
- Players can join ✓

After Match START:
- No player removal ✓
- No new joins ✓
- Settings locked ✓

After Match COMPLETE:
- View-only mode ✓
- Can create new match ✓
```

---

## Database Changes Summary

**New Collections/Modifications:**
1. `arena_matches` - New document per match
2. `users` - Add stats: matches_played, matches_won, total_xp
3. `submissions` - Add fields: arenaMatchId, submissionOrder, competitionRank

**New Redis Keys:**
1. `arena:match:{matchId}:players` - Set of active playerIds
2. `arena:match:{matchId}:code:{userId}` - Latest code per player
3. `arena:match:{matchId}:submissions` - Sorted set by timestamp

**Archive (After Match):**
- Redis keys deleted
- MongoDB arena_matches marked 'completed'
- Submissions archived with full results

---

## Deployment Checklist

- [ ] Update database schemas (Phase 1)
- [ ] Deploy backend services (Phase 2)
- [ ] Deploy frontend components (Phase 3)
- [ ] Enable host controls (Phase 4)
- [ ] Implement result storage (Phase 5)
- [ ] Optimize WebSocket (Phase 6)
- [ ] Run stress tests (Phase 7)
- [ ] Monitor production metrics
- [ ] Scale to 100+ players (next iteration)

