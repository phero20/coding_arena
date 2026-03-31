package middleware

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type AuthMiddleware struct {
	publicKey *rsa.PublicKey
}

func NewAuthMiddleware(pemPublicKey string) (*AuthMiddleware, error) {
	if pemPublicKey == "" {
		return &AuthMiddleware{}, nil // Bypass or handle error based on local dev needs
	}

	block, _ := pem.Decode([]byte(pemPublicKey))
	if block == nil {
		return nil, errors.New("failed to parse PEM block containing the public key")
	}

	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	rsaPub, ok := pub.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("not an RSA public key")
	}

	return &AuthMiddleware{publicKey: rsaPub}, nil
}

func (m *AuthMiddleware) Handle(c *fiber.Ctx) error {
	// 1. Extract token from Authorization header or Query param (for WS)
	tokenString := c.Get("Authorization")
	if strings.HasPrefix(tokenString, "Bearer ") {
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")
	} else {
		tokenString = c.Query("token")
	}

	if tokenString == "" {
		// Log but allow in local dev if public key is empty
		if m.publicKey == nil {
			log.Println("[Auth] No token provided, but public key is missing (Local Dev?)")
			return c.Next()
		}
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized: Missing token"})
	}

	// 2. Verify JWT
	if m.publicKey == nil {
		log.Println("[Auth] Warning: JWT provided but CLERK_PEM_PUBLIC_KEY is not set. Skipping verification (Local Dev).")
		// In a real production environment, we should return an error here.
		// But for now, we'll allow it to proceed to the fallback logic.
		return c.Next()
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return m.publicKey, nil
	})

	if err != nil || !token.Valid {
		log.Printf("[Auth] JWT Verification Failed: %v", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized: Invalid token"})
	}

	// 3. Extract claims (userId is usually in "sub")
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized: Invalid claims"})
	}

	userId, _ := claims["sub"].(string)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized: User ID not found in token"})
	}

	// Store userId in context for handlers
	c.Locals("userId", userId)

	return c.Next()
}
