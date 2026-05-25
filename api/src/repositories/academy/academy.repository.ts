import fs from "fs/promises";
import path from "path";

export interface IAcademyRepository {
  getTracks(): Promise<any>;
  getTrackConfig(slug: string): Promise<any>;
  getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any>;
}

export class AcademyRepository implements IAcademyRepository {
  async getTracks(): Promise<any> {
    const filePath = path.join(__dirname, "../../../../data/static-data/academy/tracks.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  async getTrackConfig(slug: string): Promise<any> {
    const filePath = path.join(__dirname, `../../../../data/static-data/academy/config/${slug}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  async getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any> {
    const filePath = path.join(__dirname, `../../../../data/static-data/academy/concepts/${trackSlug}/${conceptSlug}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }
}
