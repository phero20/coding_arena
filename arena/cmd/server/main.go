package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"arena/internal/handlers"
	"arena/internal/hub"
	"arena/internal/middleware"
	"arena/internal/repository"
	"arena/internal/service"
	"arena/pkg/config"
	"arena/pkg/redis"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Initialize Structured Logging
	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})
	slog.SetDefault(slog.New(handler))

	cfg := config.LoadConfig()

	// Initialize Redis
	redisClient, err := redis.NewRedisClient(cfg.RedisURL)
	if err != nil {
		slog.Error("Failed to connect to Redis", "error", err)
		os.Exit(1)
	}

	// Initialize Middleware
	authMid, err := middleware.NewAuthMiddleware(cfg.ClerkPublicKey)
	if err != nil {
		slog.Error("Failed to initialize Auth Middleware", "error", err)
		os.Exit(1)
	}

	// Initialize Architecture
	arenaRepo := repository.NewArenaRepository(redisClient)
	arenaService := service.NewArenaService(arenaRepo)
	arenaHub := hub.NewHub(redisClient, arenaRepo)

	// Start Hub Brain
	go arenaHub.Run()
	go arenaHub.ListenForUpdates(context.Background())

	app := fiber.New(fiber.Config{
		AppName:         "Coding Arena WebSocket Server",
		ReadBufferSize:  8192,
		WriteBufferSize: 8192,
	})

	// Middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS",
	}))
	app.Use(logger.New())
	app.Use(recover.New())

	// Enhanced Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		redisStatus := "UP"
		if err := redisClient.Ping(ctx).Err(); err != nil {
			redisStatus = "DOWN"
		}

		isHealthy := redisStatus == "UP"
		status := "HEALTHY"
		if !isHealthy {
			status = "UNHEALTHY"
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":    status,
			"timestamp": time.Now().Format(time.RFC3339),
			"checks": fiber.Map{
				"redis": redisStatus,
			},
		})
	})

	// WebSocket Upgrade Middleware
	app.Use("/arena/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// WebSocket Route
	app.Get("/arena/ws/:roomId", authMid.Handle, handlers.ArenaHandler(arenaHub, arenaService, arenaRepo))

	// Listen for OS signals for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		slog.Info("Starting Arena Server", "port", cfg.Port)
		if err := app.Listen(":" + cfg.Port); err != nil {
			slog.Error("Listen Error", "error", err)
		}
	}()

	<-sigChan
	slog.Info("Shutting down Arena Server...")

	// 1. Graceful Shutdown Fiber (timeout 10s)
	if err := app.ShutdownWithTimeout(10 * time.Second); err != nil {
		slog.Error("App Shutdown Error", "error", err)
	}

	// 2. Close Redis Connection
	if err := redisClient.Close(); err != nil {
		slog.Error("Redis Close Error", "error", err)
	}

	slog.Info("Arena Server stopped cleanly.")
}
