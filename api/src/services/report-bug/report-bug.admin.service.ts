import { ReportBugAdminRepository } from "../../repositories/report-bug/report-bug.admin.repository";
import { type ICloudinaryService } from "../common/cloudinary.service";

export class ReportBugAdminService {
  constructor(private readonly deps: { 
    reportBugAdminRepository: ReportBugAdminRepository;
    cloudinaryService: ICloudinaryService;
  }) {}

  async getAllReports() {
    return this.deps.reportBugAdminRepository.findAll();
  }

  private async processImages(images?: (File | string)[] | File | string): Promise<string[]> {
    let imageArray: (File | string)[] = [];
    if (images) {
      imageArray = Array.isArray(images) ? images : [images];
    }
    
    // Separate existing string URLs from new File objects
    const existingUrls = imageArray.filter(img => typeof img === "string") as string[];
    const filesToUpload = imageArray.filter(img => typeof img !== "string");

    let uploadedUrls: string[] = [];
    if (filesToUpload.length > 0) {
      const uploadPromises = filesToUpload.map(img => 
        this.deps.cloudinaryService.uploadImage(img, "slavecode/bug_reports")
      );
      uploadedUrls = await Promise.all(uploadPromises);
    }
    return [...existingUrls, ...uploadedUrls];
  }

  async createReport(data: any) {
    const images = await this.processImages(data.images);
    return this.deps.reportBugAdminRepository.create({ ...data, images });
  }

  async updateReport(id: string, data: any) {
    const images = await this.processImages(data.images);
    return this.deps.reportBugAdminRepository.update(id, { ...data, images });
  }

  async deleteReport(id: string) {
    return this.deps.reportBugAdminRepository.delete(id);
  }
}
