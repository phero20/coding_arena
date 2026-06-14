import { mongoose } from "../../connection";

const AcademyTrackSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // The ID of the track (e.g. "javascript")
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // The complete JSON object for the track
  },
  { timestamps: true },
);

export const AcademyTrackModel = mongoose.model("AcademyTrack", AcademyTrackSchema);
