/**
 * Public Configuration for Deployment.
 * Centralizes all environment variables and provides safety checks.
 */

export const PUBLIC_CONFIG = {
  // API Base URL (Must be set in production)
  API_URL: process.env.NEXT_PUBLIC_API_URL,

  // Arena WebSocket URL (Must be set in production)
  ARENA_WS_URL: process.env.NEXT_PUBLIC_ARENA_WS_URL,



  // Tldraw License Key
  TLDRAW_LICENSE_KEY: process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY,

  // GitHub Link
  REPO_URL: "https://github.com/phero20/slavecode",

  // Site Meta
  SITE_NAME: "SlaveCode",
  SITE_DESCRIPTION: "A complete platform for competitive programming and coding practice.",

  // Analytics
  GA_ID: process.env.NEXT_PUBLIC_GA_ID,
} as const;

// Safety check for critical production config
if (process.env.NODE_ENV === "production") {
  if (!PUBLIC_CONFIG.API_URL) {
    console.error("❌ CRITICAL: NEXT_PUBLIC_API_URL is missing in production!");
  }
  if (!PUBLIC_CONFIG.ARENA_WS_URL) {
    console.error("❌ CRITICAL: NEXT_PUBLIC_ARENA_WS_URL is missing in production!");
  }

}
