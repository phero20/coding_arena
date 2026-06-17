/**
 * Public Configuration for Admin Panel.
 * Centralizes all environment variables and provides safety checks.
 */

export const PUBLIC_CONFIG = {
  // API Base URL (Must be set in production)
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",

  // Site Meta
  SITE_NAME: "SlaveCode Admin",
  SITE_DESCRIPTION: "Administration Dashboard for SlaveCode.",
} as const;

// Safety check for critical production config
if (process.env.NODE_ENV === "production") {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error("❌ CRITICAL: NEXT_PUBLIC_API_URL is missing in production!");
  }
}
