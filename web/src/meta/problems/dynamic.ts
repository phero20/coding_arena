import type { Metadata } from "next";
import { getProblemBySlug } from "@/services/queries/problem.queries";
import { cache } from "react";

// Share this cached function to deduplicate calls between Metadata and Page render
export const getCachedProblem = cache(async (slug: string) => {
  return await getProblemBySlug(slug);
});

export async function generateProblemMetadata({ params }: { params: Promise<{ problemId: string }> }): Promise<Metadata> {
  try {
    const { problemId } = await params;
    const problem = await getCachedProblem(problemId);
    
    if (!problem) return {};

    // Build the dynamic SEO tags to beat LeetCode
    const title = `${problem.title} - Practice Coding`;
    
    const rawDescription = problem.description || "";
    const cleanDescription = rawDescription
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
    const description = cleanDescription || `Solve ${problem.title} on SlaveCode. Master data structures, algorithms, and system design with hands-on practice.`;

    return {
      title,
      description,
      keywords: [`${problem.title} solution`, "leetcode alternative", "algorithms", "data structures", "coding interview"],
      alternates: { canonical: `/problems/${problemId}` },
      openGraph: {
        title,
        description,
        type: "article",
        siteName: "SlaveCode",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (error) {
    console.error("METADATA GENERATION ERROR:", error);
    return {
      title: "Problem Not Found | SlaveCode",
    };
  }
}
