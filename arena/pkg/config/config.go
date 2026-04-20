package config

import (
	"os"
)

type Config struct {
	RedisURL       string
	Port           string
	ClerkPublicKey string
}

func LoadConfig() *Config {
	return &Config{
		RedisURL:       getEnv("REDIS_URL", "redis://localhost:6379"),
		Port:           getEnv("PORT", "8080"),
		ClerkPublicKey: getEnv("CLERK_PEM_PUBLIC_KEY", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
