import fs from "fs/promises";
import path from "path";

export interface IAcademyRepository {
  getTracks(): Promise<any>;
}

export class AcademyRepository implements IAcademyRepository {
  async getTracks(): Promise<any> {
    const filePath = path.join(__dirname, "../../static-data/academy/tracks.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }
}
