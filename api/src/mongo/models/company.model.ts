import { mongoose } from "../connection";

const CompanySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    imageUrl: { type: String },
    problem_ids: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Adding an index on name to easily sort companies alphabetically in the UI
CompanySchema.index({ name: 1 });

export type Company = {
  id?: string; // Mapped by MongoBaseRepository from _id
  slug: string;
  name: string;
  imageUrl?: string;
  problem_ids: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyDocument = Company & mongoose.Document;

export const CompanyModel =
  mongoose.models.Company ||
  mongoose.model<CompanyDocument>("Company", CompanySchema);
