import { ErrorCode } from "../utils/app-error";

export interface ErrorDefinition {
  message: string;
  code: ErrorCode;
}

export const ERRORS = {
  AUTH: {
    MISSING_TOKEN: { message: "Missing or invalid Authorization header", code: "UNAUTHORIZED" },
    MISSING_BEARER: { message: "Missing bearer token", code: "UNAUTHORIZED" },
    INVALID_TOKEN: { message: "Invalid or expired token", code: "UNAUTHORIZED" },
    INSUFFICIENT_PERMISSIONS: { message: "Insufficient permissions", code: "FORBIDDEN" },
    USER_NOT_FOUND: { message: "User not found", code: "NOT_FOUND" },
  },
  ARENA: {
    ROOM_NOT_FOUND: { message: "Arena room not found", code: "NOT_FOUND" },
    NOT_HOST: { message: "Only the host can perform this action", code: "FORBIDDEN" },
    NO_PROBLEM: { message: "No problem selected for this room", code: "BAD_REQUEST" },
    MATCH_IN_PROGRESS: { message: "Match setup already in progress", code: "CONFLICT" },
    MATCH_NOT_FOUND: { message: "Match not found", code: "NOT_FOUND" },
    ALREADY_SUBMITTED: { message: "Submission already recorded for this match.", code: "FORBIDDEN" },
  },
  PROBLEM: {
    NOT_FOUND: { message: "Problem not found", code: "NOT_FOUND" },
    TESTS_NOT_FOUND: { message: "Tests not found for given problem and type", code: "NOT_FOUND" },
  },
  SUBMISSION: {
    QUEUE_FAILED: { message: "Failed to queue submission for evaluation. Please try again.", code: "INTERNAL_ERROR" },
    NOT_FOUND: { message: "Submission not found", code: "NOT_FOUND" },
    MISSING_ID: { message: "Missing submissionId parameter", code: "BAD_REQUEST" },
    ACCESS_DENIED: { message: "You do not have access to this submission", code: "FORBIDDEN" },
  },
  COMMON: {
    INTERNAL_ERROR: { message: "An unexpected error occurred. Please try again later.", code: "INTERNAL_ERROR" },
    TOO_MANY_REQUESTS: { message: "Too many requests. Please try again later.", code: "TOO_MANY_REQUESTS" },
    BAD_REQUEST: { message: "Invalid request parameters.", code: "BAD_REQUEST" },
    MISSING_PARAMETER: { message: "Missing required parameter", code: "BAD_REQUEST" },
  }
} as const;
