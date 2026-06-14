import { mongoose } from "../../connection";

const AcademyConfigSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // The ID of the track (e.g. "javascript")
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // The complete JSON object for the track's config
  },
  { timestamps: true },
);

export const AcademyConfigModel = mongoose.model("AcademyConfig", AcademyConfigSchema);
