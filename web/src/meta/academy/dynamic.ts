import type { Metadata } from "next";

export async function generateTrackMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    title: `${title} Track`,
    description: `Master ${title} on SlaveCode. Learn the fundamentals, solve interactive exercises, and build a strong foundation.`,
    openGraph: {
      title: `${title} Track | SlaveCode Academy`,
      description: `Master ${title} on SlaveCode. Learn the fundamentals, solve interactive exercises, and build a strong foundation.`,
    }
  };
}

export async function generateExerciseMetadata({ params }: { params: Promise<{ slug: string, exerciseSlug: string }> }): Promise<Metadata> {
  const { slug, exerciseSlug } = await params;
  const trackTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const exerciseTitle = exerciseSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    title: `${exerciseTitle} - ${trackTitle}`,
    description: `Solve the ${exerciseTitle} interactive exercise in the ${trackTitle} track on SlaveCode.`,
    openGraph: {
      title: `${exerciseTitle} | ${trackTitle} Track`,
      description: `Solve the ${exerciseTitle} interactive exercise in the ${trackTitle} track on SlaveCode.`,
    }
  };
}
