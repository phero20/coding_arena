import { mongoose } from "../../connection";

const AcademyConceptSchema = new mongoose.Schema(
  {
    trackSlug: { type: String, required: true }, // e.g. "javascript"
    conceptSlug: { type: String, required: true }, // e.g. "basics"
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // The complete JSON object for the concept
  },
  { timestamps: true },
);

AcademyConceptSchema.index({ trackSlug: 1, conceptSlug: 1 }, { unique: true });

export const AcademyConceptModel = mongoose.model("AcademyConcept", AcademyConceptSchema);
