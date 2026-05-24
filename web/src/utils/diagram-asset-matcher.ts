import { DiagramAsset, DIAGRAM_ASSETS } from "@/constants/diagram-assets";

const CLOUD_SYNONYMS: Record<string, string[]> = {
  aws: ["amazon", "aws"],
  gcp: ["google", "gcp"],
  azure: ["microsoft", "azure"],
};

const STOP_WORDS = new Set([
  "and", "or", "of", "for", "on", "in", "to", "with", "at", "by", "from", "the", "a", "an"
]);

const PROVIDER_WORDS = new Set([
  "arch", "res", "aws", "amazon", "gcp", "google", "azure", "microsoft", "brand"
]);

/**
 * Tokenizes a string into lower-case alphanumeric segments.
 */
function getTokens(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Expands numeric acronyms (e.g. "s3" -> "sss", "ec2" -> "ecc", "c3" -> "ccc")
 */
function expandAcronym(acronym: string): string {
  const match = acronym.match(/^([a-z]+)([2-9])$/);
  if (match) {
    const prefix = match[1];
    const lastChar = prefix[prefix.length - 1];
    const repeat = parseInt(match[2], 10);
    return prefix.slice(0, -1) + lastChar.repeat(repeat);
  }
  return acronym;
}

/**
 * Extracts core service tokens and generates the acronym initials for the asset.
 */
function getAssetAcronymInitials(assetId: string): string {
  const tokens = getTokens(assetId);
  const coreTokens = tokens.filter(
    (token) => !PROVIDER_WORDS.has(token) && !STOP_WORDS.has(token) && !token.match(/^\d+$/)
  );

  return coreTokens.map((t) => t[0]).join("");
}

/**
 * Checks if a token matches another, taking cloud synonyms into account.
 */
function isTokenMatch(userToken: string, assetToken: string): boolean {
  if (userToken === assetToken) return true;

  for (const provider in CLOUD_SYNONYMS) {
    const list = CLOUD_SYNONYMS[provider];
    if (list.includes(userToken) && list.includes(assetToken)) {
      return true;
    }
  }

  return false;
}

/**
 * Computes a similarity score between a user's icon request and a candidate asset.
 */
function calculateScore(userIcon: string, asset: DiagramAsset): number {
  const userTokens = getTokens(userIcon);
  const idTokens = getTokens(asset.id);
  const nameTokens = getTokens(asset.name);

  if (userTokens.length === 0) return 0;

  let matchCount = 0;
  let exactMatchCount = 0;

  userTokens.forEach((uToken) => {
    const hasIdMatch = idTokens.some((iToken) => isTokenMatch(uToken, iToken));
    const hasNameMatch = nameTokens.some((nToken) => isTokenMatch(uToken, nToken));

    if (hasIdMatch || hasNameMatch) {
      matchCount++;
      if (idTokens.includes(uToken) || nameTokens.includes(uToken)) {
        exactMatchCount++;
      }
    }
  });

  // Base score: percentage of matched user tokens
  let score = matchCount / userTokens.length;

  // Add precise weights
  score += exactMatchCount * 0.1;

  // Prefer standard architectural size shapes (64px or 48px)
  if (asset.id.endsWith("_64")) {
    score += 0.05;
  } else if (asset.id.endsWith("_48")) {
    score += 0.02;
  }

  // Handle dynamic abbreviation initials checking
  const initials = getAssetAcronymInitials(asset.id);
  userTokens.forEach((uToken) => {
    if (uToken.length <= 4) {
      const expandedUser = expandAcronym(uToken);
      if (expandedUser === initials && initials.length > 0) {
        score += 0.4; // Strong weight for exact acronym initials match
      } else if (asset.id.toLowerCase().includes(uToken)) {
        score += 0.15; // Moderate weight for substring inclusion
      }
    }
  });

  return score;
}

/**
 * Resolves the best diagram asset matching the requested user icon.
 */
export function resolveDiagramAsset(userIcon: string | undefined): string {
  const fallback = "arch-category_compute";
  if (!userIcon) return fallback;

  const trimmed = userIcon.toLowerCase().trim();
  if (!trimmed) return fallback;

  let bestAsset: DiagramAsset | null = null;
  let highestScore = -1;

  for (const asset of DIAGRAM_ASSETS) {
    const score = calculateScore(trimmed, asset);
    if (score > highestScore && score > 0.1) {
      highestScore = score;
      bestAsset = asset;
    }
  }

  return bestAsset ? bestAsset.id : fallback;
}
