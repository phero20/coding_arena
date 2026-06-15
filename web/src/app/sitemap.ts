import { MetadataRoute } from "next";
import {
  getSitemapProblems,
  getSitemapAcademyTracks,
  getSitemapAcademyExercises,
  getSitemapSystemDesignLessons,
  getSitemapCompanyTags,
  getSitemapUsers,
} from "@/services/queries/seo.queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://slavecode.codes";

  // 1. The STATIC Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/academy`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compilers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contests`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/problems`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/systemdesign`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/arena`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/report-bug`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/academy/tracks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // 2. Fetch all dynamic data concurrently for maximum speed
    const [
      problems,
      academyTracks,
      academyExercises,
      systemDesignLessons,
      companyTags,
      users,
    ] = await Promise.all([
      getSitemapProblems(),
      getSitemapAcademyTracks(),
      getSitemapAcademyExercises(),
      getSitemapSystemDesignLessons(),
      getSitemapCompanyTags(),
      getSitemapUsers(),
    ]);

    // Practice Problems
    const problemPages: MetadataRoute.Sitemap = problems.map((problem) => ({
      url: `${baseUrl}/problems/${problem.problem_slug || problem.problem_id}`,
      lastModified: new Date(problem.updatedAt || new Date()),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // Academy Tracks
    const trackPages: MetadataRoute.Sitemap = academyTracks.map((track) => ({
      url: `${baseUrl}/academy/tracks/${track.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // Academy Exercises
    const exercisePages: MetadataRoute.Sitemap = academyExercises.map((exercise) => ({
      url: `${baseUrl}/academy/tracks/${exercise.trackSlug}/exercises/${exercise.exerciseSlug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    // System Design Lessons
    const systemDesignPages: MetadataRoute.Sitemap = systemDesignLessons.map((lesson) => ({
      url: `${baseUrl}/systemdesign/learn/${lesson.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    // Company Tags
    const companyPages: MetadataRoute.Sitemap = companyTags.map((company) => ({
      url: `${baseUrl}/companies/${company.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    // Company Problems Pages
    const companyProblemPages: MetadataRoute.Sitemap = companyTags.map((company) => ({
      url: `${baseUrl}/companies/${company.slug}/problems`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7, // Higher priority than base company page since it contains the actual content
    }));

    // User Profiles
    const userPages: MetadataRoute.Sitemap = users.map((user) => ({
      url: `${baseUrl}/u/${user.username}`,
      lastModified: new Date(user.updatedAt || new Date()),
      changeFrequency: "daily",
      priority: 0.5,
    }));

    dynamicPages = [
      ...problemPages,
      ...trackPages,
      ...exercisePages,
      ...systemDesignPages,
      ...companyPages,
      ...companyProblemPages,
      ...userPages,
    ];

  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    // If APIs fail, we still gracefully return the static pages to avoid a 500
  }

  return [...staticPages, ...dynamicPages];
}
