import { type IUserRepository } from "../../repositories/user/user.repository";
import { type ICradle } from "../../libs/awilix-container";
import { type User } from "../../db/schema";

export interface IUserService {
  searchUsers(query: string): Promise<User[]>;
}

export class UserService implements IUserService {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: ICradle) {
    this.userRepository = userRepository;
  }

  /**
   * Search users by username or full name.
   * Encapsulates business logic such as result limits.
   */
  async searchUsers(query: string): Promise<User[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    // Applying standard result limit for platform-wide search
    return await this.userRepository.search(query.trim(), 10);
  }
}
