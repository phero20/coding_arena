import type { User } from "../../db/schema";
import type { IUserRepository } from "../../repositories/user/user.repository";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("auth-service");

export interface AuthUserPayload {
  clerkId: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

import { type ICradle } from "../../libs/awilix-container";
import { type IClockService } from "../common/clock.service";
import {
  validateServiceInput,
  SyncUserSchema,
} from "../validation/auth.validator";

export class AuthService {
  private readonly userRepository: IUserRepository;
  private readonly clock: IClockService;

  constructor({ userRepository, clockService }: ICradle) {
    this.userRepository = userRepository;
    this.clock = clockService;
  }

  async ensureUser(payload: AuthUserPayload): Promise<User> {
    const clerkId = payload.clerkId.trim();

    const existing = await this.userRepository.findByClerkId(clerkId);
    if (existing) {
      return existing;
    }

    // Ensure unique username and email before creating
    const username = await this.generateUniqueUsername(payload.username);

    logger.info({ clerkId, username }, "User found or created via ensureUser");

    return this.userRepository.create({
      clerkId,
      username,
      email: payload.email,
      avatarUrl: payload.avatarUrl ?? undefined,
      status: "active",
      role: "user",
    });
  }

  async ensureUserFromIdOnly(clerkId: string): Promise<User | null> {
    const trimmedId = clerkId.trim();
    return this.userRepository.findByClerkId(trimmedId);
  }

  async syncUser(payload: AuthUserPayload): Promise<User> {
    validateServiceInput(SyncUserSchema, payload);
    const clerkId = payload.clerkId.trim();

    const existing = await this.userRepository.findByClerkId(clerkId);

    if (existing) {
      const updated = await this.userRepository.update(clerkId, {
        username: payload.username,
        email: payload.email,
        avatarUrl: payload.avatarUrl ?? undefined,
      });
      return updated ?? existing;
    }

    // New user from webhook - ensure uniqueness
    const username = await this.generateUniqueUsername(payload.username);

    return this.userRepository.create({
      clerkId,
      username,
      email: payload.email,
      avatarUrl: payload.avatarUrl ?? undefined,
      status: "active",
      role: "user",
    });
  }

  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await this.userRepository.findByUsername(username);
      if (!existing) {
        isUnique = true;
      } else {
        attempts++;
        // Append a random 2-digit number for collision
        const suffix = Math.floor(Math.random() * 90 + 10);
        username = `${baseUsername}_${suffix}`;
      }
    }

    return username;
  }
}
