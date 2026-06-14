import { mongoose } from "../../connection";

const AcademyExerciseSchema = new mongoose.Schema(
  {
    trackSlug: { type: String, required: true }, // e.g. "javascript"
    exerciseSlug: { type: String, required: true }, // e.g. "lasagna"
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // The complete JSON object for the exercise
  },
  { timestamps: true },
);

AcademyExerciseSchema.index({ trackSlug: 1, exerciseSlug: 1 }, { unique: true });

export const AcademyExerciseModel = mongoose.model("AcademyExercise", AcademyExerciseSchema);
