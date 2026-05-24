import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createChatThreadSchema, createChatMessageSchema } from "../../validators/chat.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import type { ChatController } from "../../controllers/chat/chat.controller";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";

export const registerChatRoutes = (
  app: Hono<AppEnv>,
  {
    chatController,
    authMiddleware,
  }: {
    chatController: ChatController;
    authMiddleware: AuthMiddleware;
  }
) => {
  const chat = new Hono<AppEnv>();

  // Secure all chat routes with Auth
  chat.use(authMiddleware.handle.bind(authMiddleware));

  // Thread Routes
  chat.post(
    "/threads",
    zValidator("json", createChatThreadSchema),
    chatController.action(chatController.createThread, { status: 201 })
  );

  chat.get(
    "/threads",
    chatController.action(chatController.getThreads)
  );

  chat.delete(
    "/threads/:id",
    chatController.action(chatController.deleteThread)
  );

  // Message Routes
  chat.get(
    "/threads/:threadId/messages",
    chatController.action(chatController.getMessages)
  );

  chat.post(
    "/threads/:threadId/messages",
    zValidator("json", createChatMessageSchema),
    chatController.action(chatController.sendMessage, { status: 201 })
  );

  app.route("/chat", chat);
};
