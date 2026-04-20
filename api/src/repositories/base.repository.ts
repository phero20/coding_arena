import mongoose, { type Document, Model, ClientSession, QueryOptions } from "mongoose";
import { omit } from "lodash-es";

export interface RepositoryOptions {
  session?: ClientSession;
  traceId?: string;
}

/**
 * MongoBaseRepository<T, Doc>
 * 
 * A generic base class for MongoDB repositories using Mongoose.
 * T: The Domain Interface (e.g., Problem, Submission).
 * Doc: The Mongoose Document Type (e.g., ProblemDocument).
 */
export abstract class MongoBaseRepository<T, Doc extends Document> {
  protected readonly model: Model<Doc>;

  constructor(model: Model<Doc>) {
    this.model = model;
  }

  /**
   * Maps a Mongoose document (or POJO from .lean()) to a plain Domain object.
   * Standardizes the 'id' mapping and metadata cleanup.
   */
  protected toDomain(doc: Doc | T | null): T | null {
    if (!doc) return null;
    
    // Convert to plain object if it's a Mongoose document.
    // .toObject() handles virtuals. If it's already a POJO (from .lean()), we use it as is.
    const obj = (doc as any).toObject ? (doc as any).toObject() : doc;
    
    // Extract ID and omit internal Mongoose fields (__v)
    const id = (obj.id || obj._id?.toString()) as string;
    const rest = omit(obj, ["_id", "__v"]);

    return {
      ...rest,
      id,
    } as T;
  }

  /**
   * Safe conversion of string ID to Mongoose ObjectId.
   */
  protected toObjectId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
  }

  protected applyOptions<Q>(query: any, options?: RepositoryOptions): any {
    if (options?.traceId) {
      query.comment(options.traceId);
    }
    if (options?.session) {
      query.session(options.session);
    }
    return query;
  }

  /**
   * Standard findById helper using .lean() for performance.
   */
  async findById(id: string, options?: RepositoryOptions): Promise<T | null> {
    const query = this.model.findById(id).lean();
    this.applyOptions(query, options);
    const doc = await query.exec();
    return this.toDomain(doc as any);
  }

  async findAll(options?: RepositoryOptions): Promise<T[]> {
    const query = this.model.find().lean();
    this.applyOptions(query, options);
    const docs = await query.exec();
    return this.toDomainArray(docs);
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
