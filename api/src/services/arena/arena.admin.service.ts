import { type ICradle } from "../../libs/awilix-container";
import { type IArenaAdminRepository } from "../../repositories/arena/arena.admin.repository";

export interface IArenaAdminService {
  getStats(): Promise<{
    totalMatches: number;
    totalSubmissions: number;
    languages: Record<string, number>;
    problems: Record<string, number>;
  }>;
}

export class ArenaAdminService implements IArenaAdminService {
  private readonly arenaAdminRepository: IArenaAdminRepository;

  constructor(cradle: ICradle) {
    this.arenaAdminRepository = cradle.arenaAdminRepository;
  }

  async getStats(): Promise<{
    totalMatches: number;
    totalSubmissions: number;
    languages: Record<string, number>;
    problems: Record<string, number>;
  }> {
    return this.arenaAdminRepository.getStats();
  }
}
