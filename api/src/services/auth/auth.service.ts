import type { User } from "../../db/schema";
import type { IUserRepository } from "../../repositories/user/user.repository";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("auth-service");

export interface AuthUserPayload {
  clerkId: string;
  username: string;
  originalClerkUsername?: string | null;
  fullName?: string | null;
  email: string;
  avatarUrl?: string | null;
}

import { type ICradle } from "../../libs/awilix-container";
import { type IClockService } from "../common/clock.service";
import {
  validateServiceInput,
  SyncUserSchema,
} from "../validation/auth.validator";
import { createClerkClient } from "@clerk/backend";

export class AuthService {
  private readonly userRepository: IUserRepository;
  private readonly clerkClient: ReturnType<typeof createClerkClient>;
  private readonly clock: IClockService;
  private readonly statsService: ICradle["statsService"];

  constructor({
    userRepository,
    clerkClient,
    clockService,
    statsService,
  }: ICradle) {
    this.userRepository = userRepository;
    this.clerkClient = clerkClient;
    this.clock = clockService;
    this.statsService = statsService;
  }

  async ensureUser(payload: AuthUserPayload): Promise<User> {
    const clerkId = payload.clerkId.trim();

    const existing = await this.userRepository.findByClerkId(clerkId);
    if (existing) {
      return existing;
    }

    // Ensure unique username and email before creating
    const username = await this.generateUniqueUsername(payload.username);

    // Back-sync to Clerk if the original payload didn't already have this username
    // We defer this until AFTER database creation to prevent webhook loops.

    logger.info({ clerkId, username }, "User found or created via ensureUser");

    try {
      const created = await this.userRepository.create({
        clerkId,
        username,
        email: payload.email,
        fullName: payload.fullName ?? null,
        avatarUrl: payload.avatarUrl ?? undefined,
        status: "active",
        role: "user",
      });

      await this.statsService.invalidateProfile(created.id);

      // Back-sync to Clerk only if creation succeeded and username was modified
      if (
        !payload.originalClerkUsername ||
        payload.originalClerkUsername !== username
      ) {
        await this.pushUsernameToClerk(clerkId, username);
      }

      return created;
    } catch (err: any) {
      if (err.code === "23505") {
        logger.warn(
          { clerkId, email: payload.email },
          "Duplicate key error on ensureUser, attempting to fetch existing user.",
        );
        const existingAfterRace =
          await this.userRepository.findByClerkId(clerkId);
        if (existingAfterRace) {
          return existingAfterRace;
        }
      }
      throw err;
    }
  }

  async ensureUserFromIdOnly(clerkId: string): Promise<User | null> {
    const trimmedId = clerkId.trim();
    return this.userRepository.findByClerkId(trimmedId);
  }

  async syncUser(payload: AuthUserPayload): Promise<User | null> {
    validateServiceInput(SyncUserSchema, payload);
    const clerkId = payload.clerkId.trim();

    const existing = await this.userRepository.findByClerkId(clerkId);

    if (existing) {
      const updated = await this.userRepository.update(clerkId, {
        username: payload.username,
        fullName: payload.fullName,
        email: payload.email,
        avatarUrl: payload.avatarUrl ?? undefined,
      });
      if (updated) {
        await this.statsService.invalidateProfile(updated.id);
      }
      return updated ?? existing;
    }

    // New user from webhook - ensure uniqueness
    const username = await this.generateUniqueUsername(payload.username);

    try {
      const created = await this.userRepository.create({
        clerkId,
        username,
        email: payload.email,
        fullName: payload.fullName ?? null,
        avatarUrl: payload.avatarUrl ?? undefined,
        status: "active",
        role: "user",
      });

      await this.statsService.invalidateProfile(created.id);

      // Push username back to Clerk only after successful DB insertion
      // and only if we actually generated a new username
      if (
        !payload.originalClerkUsername ||
        payload.originalClerkUsername !== username
      ) {
        await this.pushUsernameToClerk(clerkId, username);
      }

      return created;
    } catch (err: any) {
      if (err.code === "23505") {
        logger.warn(
          { clerkId, email: payload.email },
          "Duplicate key error on syncUser, attempting to fetch existing user.",
        );
        const existingAfterRace =
          await this.userRepository.findByClerkId(clerkId);
        if (existingAfterRace) {
          return existingAfterRace;
        }

        // This is an unrecoverable duplicate email/username for a DIFFERENT clerkId
        // We log an error and swallow the exception so the Webhook returns 200 OK
        // and stops Clerk from infinitely retrying.
        logger.error(
          { clerkId, email: payload.email },
          "CRITICAL: Webhook tried to create user but email or username is already taken by another account. Swallowing error to stop webhook loops.",
        );
        return null;
      }
      throw err;
    }
  }

  async deleteUser(clerkId: string): Promise<void> {
    logger.info({ clerkId }, "Processing user deletion request...");
    const deleted = await this.userRepository.deleteByClerkId(clerkId);

    if (deleted) {
      logger.info(
        { clerkId },
        "User and all associated data purged successfully ✅",
      );
    } else {
      logger.warn({ clerkId }, "User not found for deletion, skipping.");
    }
  }

  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    const sanitizedBase = baseUsername
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toLowerCase();
    let username = sanitizedBase;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 15) {
      const existing = await this.userRepository.findByUsername(username);
      if (!existing) {
        isUnique = true;
      } else {
        attempts++;
        // Append a random 4-digit number for collision (e.g. _1234)
        const suffix = Math.floor(1000 + Math.random() * 9000);
        username = `${sanitizedBase}_${suffix}`;
      }
    }

    // High density fallback if 15 attempts fail (appending more randomness)
    if (!isUnique) {
      username = `${sanitizedBase}_${Date.now().toString().slice(-4)}`;
    }

    return username;
  }

  /**
   * Pushes a username back to Clerk.
   * Useful for Google signups where Clerk doesn't have a username initially.
   */
  private async pushUsernameToClerk(clerkId: string, username: string) {
    try {
      logger.info(
        { clerkId, username },
        "Pushing generated username to Clerk...",
      );
      await this.clerkClient.users.updateUser(clerkId, { username });
      logger.info({ clerkId }, "Clerk username updated successfully");
    } catch (err) {
      // We don't want to crash the whole sync if Clerk update fails (e.g. rate limits)
      // but we log it as an error for visibility.
      logger.error(
        { clerkId, username, err },
        "Failed to push username back to Clerk",
      );
    }
  }
}
