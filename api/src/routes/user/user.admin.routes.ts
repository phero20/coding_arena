import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { UserAdminController } from "../../controllers/user/user.admin.controller";
import { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import { createUserAdminSchema, updateUserAdminSchema, createUserStatsAdminSchema, updateUserStatsAdminSchema, createUserActivityAdminSchema, updateUserActivityAdminSchema, createUserSolvedProblemAdminSchema, deleteUserSolvedProblemAdminSchema, createUserAcademyExerciseAdminSchema, deleteUserAcademyExerciseAdminSchema, createUserSolvedLanguageAdminSchema, deleteUserSolvedLanguageAdminSchema } from "../../validators/user/user.admin.validator";
import { UuidParamSchema } from "../../validators/common/common.validator";
import { z } from "zod";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface UserAdminRouteDeps {
  userAdminController: UserAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerUserAdminRoutes = (
  app: Hono<AppEnv>,
  deps: UserAdminRouteDeps,
) => {
  const { userAdminController, authMiddleware, authorizationMiddleware } = deps;
  const adminApp = new Hono<AppEnv>();

  adminApp.use("*", authMiddleware.handle.bind(authMiddleware));
  adminApp.use("*", authorizationMiddleware.requireRoles("admin"));

  adminApp.get(
    "/counts", 
    userAdminController.action(userAdminController.getCounts, { requireAuth: true })
  );

  adminApp.get(
    "/", 
    userAdminController.action(userAdminController.getAllUsers, { requireAuth: true })
  );
  
  adminApp.post(
    "/",
    zValidator("json", createUserAdminSchema),
    userAdminController.action(userAdminController.createUser, { requireAuth: true })
  );

  adminApp.put(
    "/:id",
    zValidator("json", updateUserAdminSchema),
    userAdminController.action(userAdminController.updateUser, { requireAuth: true })
  );

  adminApp.delete(
    "/:id",
    zValidator("param", UuidParamSchema),
    userAdminController.action(userAdminController.deleteUser, { requireAuth: true })
  );

  adminApp.get(
    "/stats/:id",
    zValidator("param", UuidParamSchema),
    userAdminController.action(userAdminController.getUserStats, { requireAuth: true })
  );

  adminApp.post(
    "/stats",
    zValidator("json", createUserStatsAdminSchema),
    userAdminController.action(userAdminController.createUserStats, { requireAuth: true })
  );

  adminApp.put(
    "/stats/:id",
    zValidator("param", UuidParamSchema),
    zValidator("json", updateUserStatsAdminSchema),
    userAdminController.action(userAdminController.updateUserStats, { requireAuth: true })
  );

  adminApp.delete(
    "/stats/:id",
    zValidator("param", UuidParamSchema),
    userAdminController.action(userAdminController.deleteUserStats, { requireAuth: true })
  );

  adminApp.get(
    "/activity/:id",
    zValidator("param", UuidParamSchema),
    userAdminController.action(userAdminController.getUserActivity, { requireAuth: true })
  );

  adminApp.post(
    "/activity",
    zValidator("json", createUserActivityAdminSchema),
    userAdminController.action(userAdminController.createUserActivity, { requireAuth: true })
  );

  const ActivityParamSchema = z.object({
    id: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  });

  adminApp.put(
    "/activity/:id/:date",
    zValidator("param", ActivityParamSchema),
    zValidator("json", updateUserActivityAdminSchema),
    userAdminController.action(userAdminController.updateUserActivity, { requireAuth: true })
  );

  adminApp.delete(
    "/activity/:id/:date",
    zValidator("param", ActivityParamSchema),
    userAdminController.action(userAdminController.deleteUserActivity, { requireAuth: true })
  );

  adminApp.get(
    "/solved-problems/:id",
    zValidator("param", UuidParamSchema),
    userAdminController.action(userAdminController.getUserSolvedProblems, { requireAuth: true })
  );

  adminApp.post(
    "/solved-problems",
    zValidator("json", createUserSolvedProblemAdminSchema),
    userAdminController.action(userAdminController.createUserSolvedProblem, { requireAuth: true })
  );

  const SolvedProblemParamSchema = z.object({
    id: z.string().uuid(),
    problemId: z.string().min(1),
  });

  adminApp.delete(
    "/solved-problems/:id/:problemId",
    zValidator("param", SolvedProblemParamSchema),
    userAdminController.action(userAdminController.deleteUserSolvedProblem, { requireAuth: true })
  );

  adminApp.get(
    "/academy-exercises/:id",
    zValidator("param", UuidParamSchema),
    userAdminController.action(userAdminController.getUserAcademyExercises, { requireAuth: true })
  );

  adminApp.post(
    "/academy-exercises",
    zValidator("json", createUserAcademyExerciseAdminSchema),
    userAdminController.action(userAdminController.createUserAcademyExercise, { requireAuth: true })
  );

  const AcademyExerciseParamSchema = z.object({
    id: z.string().uuid(),
    trackSlug: z.string().min(1),
    exerciseSlug: z.string().min(1),
  });

  adminApp.delete(
    "/academy-exercises/:id/:trackSlug/:exerciseSlug",
    zValidator("param", AcademyExerciseParamSchema),
    userAdminController.action(userAdminController.deleteUserAcademyExercise, { requireAuth: true })
  );

  adminApp.get(
    "/solved-languages/:id",
    zValidator("param", UuidParamSchema),
    userAdminController.action(userAdminController.getUserSolvedLanguages, { requireAuth: true })
  );

  adminApp.post(
    "/solved-languages",
    zValidator("json", createUserSolvedLanguageAdminSchema),
    userAdminController.action(userAdminController.createUserSolvedLanguage, { requireAuth: true })
  );

  const SolvedLanguageParamSchema = z.object({
    id: z.string().uuid(),
    problemId: z.string().min(1),
    languageId: z.string().min(1),
  });

  adminApp.delete(
    "/solved-languages/:id/:problemId/:languageId",
    zValidator("param", SolvedLanguageParamSchema),
    userAdminController.action(userAdminController.deleteUserSolvedLanguage, { requireAuth: true })
  );

  adminApp.get(
    "/solutions/:id",
    zValidator("param", UuidParamSchema),
    userAdminController.action(userAdminController.getUserSolutions, { requireAuth: true })
  );

  const SolutionParamSchema = z.object({
    id: z.string().uuid(),
    solutionId: z.string().uuid(),
  });

  adminApp.delete(
    "/solutions/:id/:solutionId",
    zValidator("param", SolutionParamSchema),
    userAdminController.action(userAdminController.deleteUserSolution, { requireAuth: true })
  );

  app.route("/admin/users", adminApp);
};
