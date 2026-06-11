import { type IReportBugRepository } from "../../repositories/report-bug/report-bug.repository";
import { type ICloudinaryService } from "../common/cloudinary.service";
import { type BugReport } from "../../db/schema";
import { AppError } from "../../utils/app-error";

export interface IReportBugService {
  submitReport(payload: {
    title: string;
    description: string;
    type: string;
    images?: (File | string)[] | File | string;
  }): Promise<BugReport>;
}

export class ReportBugService implements IReportBugService {
  private readonly reportBugRepository: IReportBugRepository;
  private readonly cloudinaryService: ICloudinaryService;

  constructor({
    reportBugRepository,
    cloudinaryService,
  }: {
    reportBugRepository: IReportBugRepository;
    cloudinaryService: ICloudinaryService;
  }) {
    this.reportBugRepository = reportBugRepository;
    this.cloudinaryService = cloudinaryService;
  }

  async submitReport(payload: {
    title: string;
    description: string;
    type: string;
    images?: (File | string)[] | File | string;
  }): Promise<BugReport> {
    const { title, description, type, images } = payload;
    
    if (!title || !description || !type) {
      throw AppError.badRequest("Missing required fields: title, description, and type are mandatory.");
    }

    // Normalize images to an array so the controller doesn't have to worry about it
    let imageArray: (File | string)[] = [];
    if (images) {
      imageArray = Array.isArray(images) ? images : [images];
    }

    // Upload images in parallel if they exist
    let uploadedUrls: string[] = [];
    if (imageArray.length > 0) {
      const uploadPromises = imageArray.map(img => 
        this.cloudinaryService.uploadImage(img, "slavecode/bug_reports")
      );
      uploadedUrls = await Promise.all(uploadPromises);
    }

    return this.reportBugRepository.createReport({
      title,
      description,
      type,
      images: uploadedUrls,
    });
  }
}
