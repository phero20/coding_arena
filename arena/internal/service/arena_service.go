package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"arena/internal/models"
	"arena/internal/repository"
)

type ArenaService struct {
	repo *repository.ArenaRepository
}

func NewArenaService(repo *repository.ArenaRepository) *ArenaService {
	return &ArenaService{repo: repo}
}

func (s *ArenaService) HandleJoin(ctx context.Context, roomId, userId, username, avatarUrl string) (*models.ArenaRoom, bool, error) {
	roomId = strings.ToUpper(roomId)

	// Create new player object
	newPlayer := models.ArenaPlayer{
		UserID:    userId,
		Username:  username,
		AvatarURL: avatarUrl,
		IsCreator: false,
		Score:     0,
		Status:    models.PlayerCoding,
		IsOffline: false,
		JoinedAt:  time.Now(),
	}

	// Atomically join the room (Lua handles capacity and existence checks)
	room, err := s.repo.AtomicJoinRoom(ctx, roomId, newPlayer)
	if err != nil {
		return nil, false, err
	}

	return room, true, nil
}

func (s *ArenaService) HandleReady(ctx context.Context, roomId, userId string, ready bool) (*models.ArenaRoom, error) {
	roomId = strings.ToUpper(roomId)
	room, err := s.repo.GetRoom(ctx, roomId)
	if err != nil {
		return nil, err
	}
	if room == nil {
		return nil, errors.New("room not found")
	}

	if room.Players == nil {
		return nil, errors.New("room is empty")
	}

	player, ok := room.Players[userId]
	if !ok {
		return nil, errors.New("player not in room")
	}

	room.Players[userId] = player

	if err := s.repo.SaveRoom(ctx, room); err != nil {
		return nil, err
	}

	return room, nil
}

func (s *ArenaService) HandleStartMatch(ctx context.Context, roomId, userId string) (*models.ArenaRoom, error) {
	roomId = strings.ToUpper(roomId)

	// Atomically start the match (Lua handles permissions, status, and player count)
	room, err := s.repo.AtomicStartMatch(ctx, roomId, userId)
	if err != nil {
		return nil, err
	}

	return room, nil
}

func (s *ArenaService) HandleProgressUpdate(ctx context.Context, roomId, userId string, testsPassed, totalTests int) (*models.ArenaRoom, error) {
	roomId = strings.ToUpper(roomId)

	// Atomically update progress and calculate score in Redis
	room, err := s.repo.AtomicUpdateProgress(ctx, roomId, userId, testsPassed, totalTests)
	if err != nil {
		return nil, err
	}

	return room, nil
}

func (s *ArenaService) HandleExplicitLeave(ctx context.Context, roomId, userId string) (*models.ArenaRoom, bool, error) {
	roomId = strings.ToUpper(roomId)
	room, err := s.repo.GetRoom(ctx, roomId)
	if err != nil {
		return nil, false, err
	}
	if room == nil {
		return nil, false, nil
	}

	if room.Players == nil {
		return room, false, nil
	}

	player, ok := room.Players[userId]
	if !ok {
		return room, false, nil
	}

	if room.Status == models.StatusPlaying {
		// Mid-battle explicit leave: Mark as offline instead of removing
		player.IsOffline = true
		room.Players[userId] = player
	} else {
		// Lobby Phase: Hard Leave
		if player.IsCreator {
			// If creator explicitly leaves via button in lobby, delete room
			if err := s.repo.DeleteRoom(ctx, roomId); err != nil {
				return nil, true, err
			}
			return nil, true, nil
		}
		// Otherwise remove regular player
		delete(room.Players, userId)
	}

	if err := s.repo.SaveRoom(ctx, room); err != nil {
		return nil, false, err
	}

	return room, false, nil
}

func (s *ArenaService) HandleConnectionLoss(ctx context.Context, roomId, userId string) (*models.ArenaRoom, error) {
	roomId = strings.ToUpper(roomId)
	room, err := s.repo.GetRoom(ctx, roomId)
	if err != nil {
		return nil, err
	}
	if room == nil || room.Players == nil {
		return nil, nil
	}

	player, ok := room.Players[userId]
	if !ok {
		return nil, nil
	}

	if room.Status == models.StatusPlaying {
		// Mid-battle disconnection: Mark as offline
		player.IsOffline = true
		room.Players[userId] = player
		if err := s.repo.SaveRoom(ctx, room); err != nil {
			return nil, err
		}
		return room, nil
	}

	// Lobby Phase disconnection: Remove player entirely
	if player.IsCreator {
		// If creator disconnects in lobby, delete room
		if err := s.repo.DeleteRoom(ctx, roomId); err != nil {
			return nil, err
		}
		return nil, nil
	}

	delete(room.Players, userId)
	if err := s.repo.SaveRoom(ctx, room); err != nil {
		return nil, err
	}

	return room, nil
}
