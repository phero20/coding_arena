import { type ICradle } from "../../libs/awilix-container";
import type { IContestAdminRepository } from "../../repositories/contest/contest.admin.repository";
import type { Contest, NewContest } from "../../db/schema";
import { AppError } from "../../utils/app-error";

export interface IContestAdminService {
  getAll(): Promise<Contest[]>;
  create(payload: NewContest): Promise<Contest>;
  update(id: string, payload: Partial<Contest>): Promise<Contest>;
  delete(id: string): Promise<void>;
  getStats(): Promise<{ contests: number }>;
}

export class ContestAdminService implements IContestAdminService {
  private readonly repo: IContestAdminRepository;

  constructor({ contestAdminRepository }: ICradle) {
    this.repo = contestAdminRepository;
  }

  async getAll(): Promise<Contest[]> {
    return this.repo.getAll();
  }

  async create(payload: NewContest): Promise<Contest> {
    return this.repo.create(payload);
  }

  async update(id: string, payload: Partial<Contest>): Promise<Contest> {
    const updated = await this.repo.update(id, payload);
    if (!updated) {
      throw AppError.notFound("Contest not found");
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async getStats(): Promise<{ contests: number }> {
    return this.repo.getStats();
  }
}
