import { BaseController } from "../base.controller";
import { type IUserRepository } from "../../repositories/user/user.repository";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { z } from "zod";
import { AppError } from "../../utils/app-error";

export const updateProfileSchema = z.object({
  githubUsername: z.string().nullable().optional(),
  linkedinUsername: z.string().nullable().optional(),
  leetcodeUsername: z.string().nullable().optional(),
});

export class ProfileController extends BaseController {
  private readonly userRepository: IUserRepository;

  constructor(cradle: ICradle) {
    super(cradle);
    this.userRepository = cradle.userRepository;
  }

  /**
   * PATCH /users/profile
   * Updates the authenticated user's profile information.
   */
  async updateProfile(req: ControllerRequest<z.infer<typeof updateProfileSchema>>) {
    const clerkId = req.clerkUserId;
    if (!clerkId) {
      throw AppError.unauthorized("Authentication required");
    }

    const data = req.body;
    const updatePayload = updateProfileSchema.parse(data);

    // Filter out undefined and convert empty strings to null for consistency
    const sanitizedPayload: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(updatePayload)) {
      if (value !== undefined) {
        sanitizedPayload[key] = value === "" ? null : value;
      }
    }

    const updatedUser = await this.userRepository.update(clerkId, sanitizedPayload);

    if (!updatedUser) {
      throw AppError.notFound("User not found");
    }

    return { 
      message: "Profile updated successfully", 
      user: {
        githubUsername: updatedUser.githubUsername,
        linkedinUsername: updatedUser.linkedinUsername,
        leetcodeUsername: updatedUser.leetcodeUsername,
      } 
    };
  }
}
