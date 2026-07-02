export const revalidate = 86400; // Cache dynamic exercise page for 24 hours

import { AcademyWorkspace } from "@/components/academy/editor/AcademyWorkspace";
import { getCachedTrackExercise } from "@/meta/academy/dynamic";
import { ErrorDisplay } from "@/components/shared/StatusState";
import { Suspense } from "react";
import ExerciseSkeleton from "./ExerciseSkeleton";

export { generateExerciseMetadata as generateMetadata } from "@/meta/academy/dynamic";

const getExercise = async (trackSlug: string, exerciseSlug: string) => {
  try {
    return await getCachedTrackExercise(trackSlug, exerciseSlug);
  } catch (error: any) {
    return null;
  }
};

type Props = {
  params: Promise<{ slug: string; exerciseSlug: string }>;
};

async function ExerciseData({ paramsPromise }: { paramsPromise: Promise<{ slug: string; exerciseSlug: string }> }) {
  const resolvedParams = await paramsPromise;
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

export default function AcademyExercisePage({ params }: Props) {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<ExerciseSkeleton />}>
        <ExerciseData paramsPromise={params} />
      </Suspense>
    </main>
  );
}
