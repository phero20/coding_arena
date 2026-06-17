import { AcademyTrackModel } from "../../mongo/models/academymodels/academy-track.model";
import { AcademyConfigModel } from "../../mongo/models/academymodels/academy-config.model";
import { AcademyConceptModel } from "../../mongo/models/academymodels/academy-concept.model";
import { AcademyExerciseModel } from "../../mongo/models/academymodels/academy-exercise.model";

export interface IAcademyAdminRepository {
  createTrack(slug: string, data: any): Promise<any>;
  updateTrack(slug: string, data: any): Promise<any>;
  deleteTrack(slug: string): Promise<boolean>;
  getAllTracks(): Promise<any[]>;

  createConfig(slug: string, data: any): Promise<any>;
  updateConfig(slug: string, data: any): Promise<any>;
  deleteConfig(slug: string): Promise<boolean>;
  getAllConfigs(): Promise<any[]>;

  createConcept(trackSlug: string, conceptSlug: string, data: any): Promise<any>;
  updateConcept(trackSlug: string, conceptSlug: string, data: any): Promise<any>;
  deleteConcept(trackSlug: string, conceptSlug: string): Promise<boolean>;
  getConceptsByTrack(trackSlug: string): Promise<any[]>;

  createExercise(trackSlug: string, exerciseSlug: string, data: any): Promise<any>;
  updateExercise(trackSlug: string, exerciseSlug: string, data: any): Promise<any>;
  deleteExercise(trackSlug: string, exerciseSlug: string): Promise<boolean>;
  getExercisesByTrack(trackSlug: string): Promise<any[]>;
}

export class AcademyAdminRepository implements IAcademyAdminRepository {
  async createTrack(slug: string, data: any): Promise<any> {
    const track = new AcademyTrackModel({ slug, data });
    await track.save();
    return track.toObject();
  }

  async updateTrack(slug: string, data: any): Promise<any> {
    const updated = await AcademyTrackModel.findOneAndUpdate(
      { slug },
      { $set: { data } },
      { new: true }
    ).lean();
    return updated;
  }

  async deleteTrack(slug: string): Promise<boolean> {
    const result = await AcademyTrackModel.deleteOne({ slug });
    return result.deletedCount > 0;
  }

  async getAllTracks(): Promise<any[]> {
    return await AcademyTrackModel.find({}).lean();
  }

  // Configs
  async createConfig(slug: string, data: any): Promise<any> {
    const config = new AcademyConfigModel({ slug, data });
    await config.save();
    return config.toObject();
  }

  async updateConfig(slug: string, data: any): Promise<any> {
    const updated = await AcademyConfigModel.findOneAndUpdate(
      { slug },
      { $set: { data } },
      { new: true }
    ).lean();
    return updated;
  }

  async deleteConfig(slug: string): Promise<boolean> {
    const result = await AcademyConfigModel.deleteOne({ slug });
    return result.deletedCount > 0;
  }

  async getAllConfigs(): Promise<any[]> {
    return await AcademyConfigModel.find({}).lean();
  }

  // Concepts
  async createConcept(trackSlug: string, conceptSlug: string, data: any): Promise<any> {
    const concept = new AcademyConceptModel({ trackSlug, conceptSlug, data });
    await concept.save();
    return concept.toObject();
  }

  async updateConcept(trackSlug: string, conceptSlug: string, data: any): Promise<any> {
    const updated = await AcademyConceptModel.findOneAndUpdate(
      { trackSlug, conceptSlug },
      { $set: { data } },
      { new: true }
    ).lean();
    return updated;
  }

  async deleteConcept(trackSlug: string, conceptSlug: string): Promise<boolean> {
    const result = await AcademyConceptModel.deleteOne({ trackSlug, conceptSlug });
    return result.deletedCount > 0;
  }

  async getConceptsByTrack(trackSlug: string): Promise<any[]> {
    return await AcademyConceptModel.find({ trackSlug }).lean();
  }

  // Exercises
  async createExercise(trackSlug: string, exerciseSlug: string, data: any): Promise<any> {
    const exercise = new AcademyExerciseModel({ trackSlug, exerciseSlug, data });
    await exercise.save();
    return exercise.toObject();
  }

  async updateExercise(trackSlug: string, exerciseSlug: string, data: any): Promise<any> {
    const updated = await AcademyExerciseModel.findOneAndUpdate(
      { trackSlug, exerciseSlug },
      { $set: { data } },
      { new: true }
    ).lean();
    return updated;
  }

  async deleteExercise(trackSlug: string, exerciseSlug: string): Promise<boolean> {
    const result = await AcademyExerciseModel.deleteOne({ trackSlug, exerciseSlug });
    return result.deletedCount > 0;
  }

  async getExercisesByTrack(trackSlug: string): Promise<any[]> {
    return await AcademyExerciseModel.find({ trackSlug }).lean();
  }
}
