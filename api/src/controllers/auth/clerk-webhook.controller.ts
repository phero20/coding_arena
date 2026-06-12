import type { Context } from "hono";
import { ControllerRequest } from "../../types/infrastructure/hono.types";
import { Webhook } from "svix";
import type { AuthService } from "../../services/auth/auth.service";
import { AppError } from "../../utils/app-error";
import { ApiResponse } from "../../utils/api-response";
import { config } from "../../configs/env";

import { BaseController } from "../base.controller";
import { type ICradle } from "../../libs/awilix-container";

export class ClerkWebhookController extends BaseController {
  private readonly authService: AuthService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.authService = cradle.authService;
  }

  async handle(req: ControllerRequest) {
    const WEBHOOK_SECRET = config.clerkWebhookSecret;

    if (!WEBHOOK_SECRET) {
      throw AppError.internal("Webhook verification failed: Secret missing");
    }

    const payload = req.rawBody;
    if (!payload) {
      throw AppError.badRequest("Webhook body is missing");
    }

    const headers = {
      "svix-id": req.headers["svix-id"] ?? "",
      "svix-timestamp": req.headers["svix-timestamp"] ?? "",
      "svix-signature": req.headers["svix-signature"] ?? "",
    };

    const wh = new Webhook(WEBHOOK_SECRET);
    let event: any;

    try {
      event = wh.verify(payload, headers);
    } catch (err) {
      throw AppError.badRequest("Invalid Clerk webhook signature", err);
    }

    if (event.type === "user.created" || event.type === "user.updated") {
      const user = event.data;

      const primaryEmail =
        user.email_addresses?.find(
          (e: any) => e.id === user.primary_email_address_id,
        )?.email_address ?? user.email_addresses?.[0]?.email_address;

      const fullName = 
        user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.first_name || user.last_name || null;

      await this.authService.syncUser({
        clerkId: user.id,
        originalClerkUsername: user.username,
        username:
          user.username ||
          (primaryEmail ? primaryEmail.split("@")[0] : `user_${user.id}`),
        fullName,
        email: primaryEmail ?? "",
        avatarUrl: user.image_url,
      });
    } else if (event.type === "user.deleted") {
      const user = event.data;
      await this.authService.deleteUser(user.id);
    }

    return {
      received: true,
      type: event.type,
    };
  }
}
