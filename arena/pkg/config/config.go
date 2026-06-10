package config

import (
	"os"
)

type Config struct {
	RedisURL       string
	Port           string
	ClerkPublicKey string
	ClientURL      string
}

func LoadConfig() *Config {
	return &Config{
		RedisURL:       getEnv("REDIS_URL", ""),
		Port:           getEnv("PORT", "8080"),
		ClerkPublicKey: getEnv("CLERK_PEM_PUBLIC_KEY", ""),
		ClientURL:      getEnv("CLIENT_URL", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
