/**
 * Sanitizes problem descriptions before sending them to an AI model.
 */
export interface SanitizeProfile {
  maxLength: number;
  preserveHtmlStructure?: boolean;
  stripBase64Only?: boolean;
}

export const SANITIZE_PROFILES = {
  STRICT: {
    maxLength: 3000,
    preserveHtmlStructure: false,
    stripBase64Only: false,
  },
  LOOSE: {
    maxLength: 15000,
    preserveHtmlStructure: true,
    stripBase64Only: true,
  },
};

export function sanitizeDescriptionForAi(
  text: string | null | undefined,
  profile: SanitizeProfile = SANITIZE_PROFILES.STRICT
): string {
  if (!text) return "";

  let cleaned = text;

  // 1. Remove/Replace Base64 images (specifically targeting massive data strings)
  if (profile.stripBase64Only) {
    // Loose mode: Replace data with a short marker to keep the context that an image exists
    cleaned = cleaned.replace(/data:image\/[^;]+;base64,[^"'\s\)]+/g, "[IMAGE_REMOVED_TO_SAVE_TOKENS]");
  } else {
    // Strict mode: Aggressive removal of anything that looks like base64
    cleaned = cleaned.replace(/data:image\/[^;]+;base64,[^"'\s\)]+/g, "");
  }

  // 2. Handle HTML
  if (!profile.preserveHtmlStructure) {
    // Remove all HTML tags completely
    cleaned = cleaned.replace(/<[^>]*>?/gm, " ");
  } else {
    // Loose mode: Keep basic layout but remove heavy attributes
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""); 
  }

  // 3. Trim extra whitespace (saves tokens)
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // 4. Truncate if still too long
  if (cleaned.length > profile.maxLength) {
    return cleaned.substring(0, profile.maxLength) + "... [TRUNCATED DUE TO SIZE]";
  }

  return cleaned;
}
