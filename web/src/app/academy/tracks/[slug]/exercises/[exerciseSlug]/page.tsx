import { AcademyWorkspace } from "@/components/academy/editor/AcademyWorkspace";
import { getTrackExercise } from "@/services/queries/academy.queries";
import { ErrorDisplay } from "@/components/shared/StatusState";
import { cache } from "react";

export { generateExerciseMetadata as generateMetadata } from "@/meta/academy/dynamic";

const getExercise = cache(async (trackSlug: string, exerciseSlug: string) => {
  try {
    return await getTrackExercise(trackSlug, exerciseSlug);
  } catch (error: any) {
    return null;
  }
});

type Props = {
  params: Promise<{ slug: string; exerciseSlug: string }>;
};

export default async function AcademyExercisePage({ params }: Props) {
  const resolvedParams = await params;
  const exercise = await getExercise(resolvedParams.slug, resolvedParams.exerciseSlug);

  if (!exercise) {
    return (
      <ErrorDisplay
        title="Exercise Not Found"
        message="Failed to load the exercise environment. It might not exist."
      />
    );
  }

  return (
    <AcademyWorkspace exercise={exercise} trackSlug={resolvedParams.slug} />
  );
}
