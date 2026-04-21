import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createRoomSchema, updateRoomProblemSchema } from "../validators/arena.validator";
import { RoomIdParamSchema, MatchIdParamSchema } from "../validators/common.validator";
import type { ArenaController } from "../controllers/arena.controller";
import type { AppEnv } from "../types/hono.types";
import type { AuthMiddleware } from "../middlewares/auth.middleware";

export interface ArenaRoutesDeps {
  arenaController: ArenaController;
  authMiddleware: AuthMiddleware;
}

export const registerArenaRoutes = (app: Hono<AppEnv>, deps: ArenaRoutesDeps) => {
  const { arenaController, authMiddleware } = deps;

  // REST endpoints for Arena - Secured with authMiddleware
  // Controllers now use context-free handlers via the .action() adapter
  
  app.post(
    "/arena/create",
    (c, next) => authMiddleware.handle(c, next),
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
    zValidator("param", RoomIdParamSchema),
    arenaController.action(arenaController.startMatch),
  );

  app.get(
    "/arena/match/:matchId/status",
    (c, next) => authMiddleware.handle(c, next),
    zValidator("param", MatchIdParamSchema),
    arenaController.action(arenaController.getMatchStatus),
  );
};
