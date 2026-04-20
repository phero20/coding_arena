# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod and sum files
COPY arena/go.mod arena/go.sum ./
RUN go mod download

# Copy source code
COPY arena/ ./

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o arena-server ./cmd/server/main.go

# Run stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/arena-server .

# Expose port
EXPOSE 8080

# Command to run
CMD ["./arena-server"]
