import fs from "fs/promises";
import path from "path";

export interface ISystemDesignRepository {
  getTopics(): Promise<any>;
  getTopicContent(slug: string): Promise<any>;
}

export class SystemDesignRepository implements ISystemDesignRepository {
  async getTopics(): Promise<any> {
    const filePath = path.join(__dirname, "../../../../data/static-data/system-design/topics.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  async getTopicContent(slug: string): Promise<any> {
    const topicsDir = path.join(__dirname, "../../../../data/static-data/system-design/topics");
    const files = await fs.readdir(topicsDir);
    
    const targetFile = files.find(file => file.endsWith(`-${slug}.mdx`));
    
    if (!targetFile) {
      return null;
    }

    const filePath = path.join(topicsDir, targetFile);
    const data = await fs.readFile(filePath, "utf-8");
    return { content: data };
  }
}
