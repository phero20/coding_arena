import type { Metadata } from "next";
import { PUBLIC_CONFIG } from "@/config/public.config";
import { getTrackExercise } from "@/services/queries/academy.queries";
import { cache } from "react";

// Share this cached function to deduplicate calls between Metadata and Page render
export const getCachedTrackExercise = cache(async (slug: string, exerciseSlug: string) => {
  return await getTrackExercise(slug, exerciseSlug);
});

export async function generateTrackMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    title: `${title} Track`,
    description: `Master ${title} on SlaveCode. Learn the fundamentals, solve interactive exercises, and build a strong foundation.`,
    alternates: { canonical: `/academy/tracks/${slug}` },
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
  
  const fallbackDescription = `Solve the ${exerciseTitle} interactive exercise in the ${trackTitle} track on SlaveCode.`;
  
  try {
    const exercise = await getCachedTrackExercise(slug, exerciseSlug);
    let description = fallbackDescription;
    
    if (exercise) {
      // Prefer blurb, then instructions, then introduction
      const rawDesc = exercise?.blurb || exercise?.instructions || exercise?.introduction || "";
      const cleanDesc = rawDesc
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')   // Replace non-breaking spaces
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')      // Collapse multiple spaces into one
        .substring(0, 160)
        .trim();
      
      if (cleanDesc) {
        description = cleanDesc;
      }
    }

    return {
      title: `${exerciseTitle} - ${trackTitle}`,
      description,
      keywords: [`${exerciseTitle} solution`, "learn coding", trackTitle, "algorithms", "coding interview"],
      openGraph: {
        title: `${exerciseTitle} | ${trackTitle} Track`,
        description,
        type: "article",
        siteName: "SlaveCode",
      },
      twitter: {
        card: "summary_large_image",
        title: `${exerciseTitle} - ${trackTitle}`,
        description,
      },
    };
  } catch (error) {
    console.error("METADATA GENERATION ERROR:", error);
    return {
      title: `${exerciseTitle} - ${trackTitle} | SlaveCode`,
    };
  }
}
