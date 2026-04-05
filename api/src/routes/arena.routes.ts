import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createRoomSchema, updateRoomProblemSchema } from "../validators/arena.validator";
import type { ArenaController } from "../controllers/arena.controller";
import type { AppEnv } from "../types/hono.types";
import type { AuthMiddleware } from "../middlewares/auth.middleware"; // Assuming AuthMiddleware is exported from here

export interface ArenaRoutesDeps {
  arenaController: ArenaController;
  authMiddleware: AuthMiddleware;
}

export const registerArenaRoutes = (app: Hono<AppEnv>, deps: ArenaRoutesDeps) => {
  const { arenaController, authMiddleware } = deps;

  // REST endpoints for Arena - Secured with authMiddleware
  app.post(
    "/arena/create",
    (c, next) => authMiddleware.handle(c, next),
    zValidator("json", createRoomSchema),
    (c) => arenaController.createRoom(c),
  );
  app.get(
    "/arena/:roomId",
    (c, next) => authMiddleware.handle(c, next),
    (c) => arenaController.getRoom(c),
  );
  app.put(
    "/arena/:roomId/problem",
    (c, next) => authMiddleware.handle(c, next),
    zValidator("json", updateRoomProblemSchema),
    (c) => arenaController.updateRoomProblem(c),
  );
  app.post(
    "/arena/:roomId/start",
    (c, next) => authMiddleware.handle(c, next),
    (c) => arenaController.startMatch(c),
  );
  app.get(
    "/arena/match/:matchId/status",
    (c, next) => authMiddleware.handle(c, next),
    (c) => arenaController.getMatchStatus(c),
  );
};

