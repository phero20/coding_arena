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
	room, err := s.repo.GetRoom(ctx, roomId)
	if err != nil {
		return nil, false, err
	}
	if room == nil {
		return nil, false, errors.New("room not found")
	}

	// If player already in room, just return room
	if room.Players != nil {
		if _, ok := room.Players[userId]; ok {
			return room, false, nil
		}
	}

	// Limit to 2 players (PVP)
	if len(room.Players) >= 50 {
		return nil, false, errors.New("room is full")
	}

	// Create new player
	newPlayer := models.ArenaPlayer{
		UserID:    userId,
		Username:  username,
		AvatarURL: avatarUrl,
		IsCreator: false,
		Score:     0,
		Status:    models.PlayerCoding,
		JoinedAt:  time.Now(),
	}

	if room.Players == nil {
		room.Players = make(map[string]models.ArenaPlayer)
	}
	room.Players[userId] = newPlayer
	if err := s.repo.SaveRoom(ctx, room); err != nil {
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

	// Only creator can start the match
	player, ok := room.Players[userId]
	if !ok || !player.IsCreator {
		return nil, errors.New("only room creator can start the match")
	}

	// Check if all players are ready
	if len(room.Players) < 2 {
		return nil, errors.New("not enough players to start")
	}

	now := time.Now()
	room.Status = models.StatusPlaying
	room.StartTime = &now

	if err := s.repo.SaveRoom(ctx, room); err != nil {
		return nil, err
	}

	return room, nil
}

func (s *ArenaService) HandleProgressUpdate(ctx context.Context, roomId, userId string, testsPassed, totalTests int) (*models.ArenaRoom, error) {
	roomId = strings.ToUpper(roomId)
	room, err := s.repo.GetRoom(ctx, roomId)
	if err != nil {
		return nil, err
	}
	if room == nil {
		return nil, errors.New("room not found")
	}

	if room.Players == nil {
		room.Players = make(map[string]models.ArenaPlayer)
	}

	player, ok := room.Players[userId]
	if !ok {
		return nil, errors.New("player not in room")
	}

	player.TestsPassed = testsPassed
	player.TotalTests = totalTests
	// Basic score calculation: percentage of tests passed
	if totalTests > 0 {
		player.Score = (testsPassed * 100) / totalTests
	}
	room.Players[userId] = player

	if err := s.repo.SaveRoom(ctx, room); err != nil {
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

	wasCreator := player.IsCreator

	if wasCreator {
		// If creator explicitly leaves via button, delete room
		if err := s.repo.DeleteRoom(ctx, roomId); err != nil {
			return nil, true, err
		}
		return nil, true, nil
	}

	// Otherwise remove player
	delete(room.Players, userId)
	if err := s.repo.SaveRoom(ctx, room); err != nil {
		return nil, false, err
	}

	return room, false, nil
}
