package models

import "time"

type ArenaRoomStatus string

const (
	StatusWaiting  ArenaRoomStatus = "WAITING"
	StatusLobby    ArenaRoomStatus = "LOBBY"
	StatusPlaying  ArenaRoomStatus = "PLAYING"
	StatusFinished ArenaRoomStatus = "FINISHED"
)

type ArenaPlayerStatus string

const (
	PlayerCoding    ArenaPlayerStatus = "CODING"
	PlayerSubmitted ArenaPlayerStatus = "SUBMITTED"
)

type ArenaPlayer struct {
	UserID      string            `json:"userId"`
	Username    string            `json:"username"`
	AvatarURL   string            `json:"avatarUrl,omitempty"`
	IsCreator   bool              `json:"isCreator"`
	Score       int               `json:"score"`
	TestsPassed int               `json:"testsPassed"`
	TotalTests  int               `json:"totalTests"`
	SubmittedAt *time.Time        `json:"submittedAt,omitempty"`
	Status      ArenaPlayerStatus `json:"status"`
	IsOffline   bool              `json:"isOffline"`
	JoinedAt    time.Time         `json:"joinedAt"`
}

type ArenaRoom struct {
	RoomID      string                 `json:"roomId"`
	Status      ArenaRoomStatus        `json:"status"`
	Topic       string                 `json:"topic,omitempty"`
	ProblemID   string                 `json:"problemId,omitempty"`
	ProblemSlug string                 `json:"problemSlug,omitempty"`
	Difficulty  string                 `json:"difficulty,omitempty"`
	Language    string                 `json:"language,omitempty"`
	Players     map[string]ArenaPlayer `json:"players"`
	CreatedAt   time.Time              `json:"createdAt"`
	StartTime   *time.Time             `json:"startTime,omitempty"`
	WinnerID    string                 `json:"winnerId,omitempty"`
}

type ArenaWSMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}
