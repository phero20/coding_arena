import { authService } from "./service.container";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { AuthorizationMiddleware } from "../../middlewares/authorization.middleware";

export const authMiddleware = new AuthMiddleware(authService);
export const authorizationMiddleware = new AuthorizationMiddleware();
