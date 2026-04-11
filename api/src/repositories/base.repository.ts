import type { Document, Model } from "mongoose";

/**
 * MongoBaseRepository<T, Doc>
 * 
 * A generic base class for MongoDB repositories using Mongoose.
 * T: The Domain Interface (e.g., Problem, Submission).
 * Doc: The Mongoose Document Type (e.g., ProblemDocument).
 */
export abstract class MongoBaseRepository<T, Doc extends Document> {
  constructor(protected readonly model: Model<Doc>) {}

  /**
   * Maps a Mongoose document (or null) to a plain Domain object.
   * Standardizes the 'id' mapping and metadata cleanup.
   */
  protected toDomain(doc: Doc | null): T | null {
    if (!doc) return null;
    
    // Convert to plain object. This handles virtuals and hides __v by default in many configs
    const obj = doc.toObject();
    
    return {
      ...obj,
      id: doc._id.toString(), // Ensure we always have a string 'id'
    } as T;
  }

  /**
   * Standard findById helper.
   */
  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).exec();
    return this.toDomain(doc);
  }

  /**
   * Helper to map an array of documents to domain objects.
   */
  protected toDomainArray(docs: Doc[]): T[] {
    return docs
      .map((doc) => this.toDomain(doc))
      .filter((item): item is T => item !== null);
  }
}
