import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createRoomSchema,
  updateRoomProblemSchema,
} from "../../validators/arena/arena.validator";
import {
  RoomIdParamSchema,
  MatchIdParamSchema,
} from "../../validators/common/common.validator";
import type { ArenaController } from "../../controllers/arena/arena.controller";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { RateLimitMiddleware } from "../../middlewares/security/rate-limit.middleware";

export interface ArenaRoutesDeps {
  arenaController: ArenaController;
  authMiddleware: AuthMiddleware;
  rateLimitMiddleware: RateLimitMiddleware;
}

export const registerArenaRoutes = (
  app: Hono<AppEnv>,
  deps: ArenaRoutesDeps,
) => {
  const { arenaController, authMiddleware, rateLimitMiddleware } = deps;

  // REST endpoints for Arena - Secured with authMiddleware
  // Controllers now use context-free handlers via the .action() adapter

  app.post(
    "/arena/create",
    (c, next) => authMiddleware.handle(c, next),
    rateLimitMiddleware.limit({
      windowMs: 60000,
      max: 5,
      keyPrefix: "rl:arena_create",
    }),
    zValidator("json", createRoomSchema),
    arenaController.action(arenaController.createRoom, { status: 201 }),
  );

  app.get(
    "/arena/:roomId",
    (c, next) => authMiddleware.handle(c, next),
    zValidator("param", RoomIdParamSchema),
    arenaController.action(arenaController.getRoom),
  );

  app.put(
    "/arena/:roomId/problem",
    (c, next) => authMiddleware.handle(c, next),
    zValidator("param", RoomIdParamSchema),
    zValidator("json", updateRoomProblemSchema),
    arenaController.action(arenaController.updateRoomProblem),
  );

  app.post(
    "/arena/:roomId/start",
    (c, next) => authMiddleware.handle(c, next),
    rateLimitMiddleware.limit({
      windowMs: 60000,
      max: 5,
      keyPrefix: "rl:arena_start",
    }),
    zValidator("param", RoomIdParamSchema),
    arenaController.action(arenaController.startMatch),
  );

  app.get(
    "/arena/match/:matchId/status",
    (c, next) => authMiddleware.handle(c, next),
    zValidator("param", MatchIdParamSchema),
    arenaController.action(arenaController.getMatchStatus, {
      requireAuth: false,
    }),
  );

  app.get(
    "/arena/match/:matchId/details",
    (c, next) => authMiddleware.handle(c, next),
    zValidator("param", MatchIdParamSchema),
    arenaController.action(arenaController.getMatchDetail, {
      requireAuth: false,
    }),
  );

  app.get(
    "/arena/u/:userId/history",
    (c, next) => authMiddleware.handle(c, next),
    arenaController.action(arenaController.getUserHistory, {
      requireAuth: false,
    }),
  );
};
