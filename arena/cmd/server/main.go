package main

import (
	"context"
	"log"

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
	cfg := config.LoadConfig()

	// Initialize Redis
	redisClient, err := redis.NewRedisClient(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	// Initialize Middleware
	authMid, err := middleware.NewAuthMiddleware(cfg.ClerkPublicKey)
	if err != nil {
		log.Fatalf("Failed to initialize Auth Middleware: %v", err)
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

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("Arena Server is running 🚀")
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

	log.Printf("Starting Arena Server on port %s...", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
