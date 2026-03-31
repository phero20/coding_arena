import { Hono } from "hono";
import { ArenaController } from "../controllers/arena.controller";

export interface ArenaRoutesDeps {
  arenaController: ArenaController;
  authMiddleware: any;
}

export const registerArenaRoutes = (app: Hono, deps: ArenaRoutesDeps) => {
  const { arenaController, authMiddleware } = deps;

  // REST endpoints for Arena - Secured with authMiddleware
  app.post("/arena/create", (c, next) => authMiddleware.handle(c, next), (c) => arenaController.createRoom(c));
  app.get("/arena/:roomId", (c, next) => authMiddleware.handle(c, next), (c) => arenaController.getRoom(c));
  app.put("/arena/:roomId/problem", (c, next) => authMiddleware.handle(c, next), (c) => arenaController.updateRoomProblem(c));
};
