import type { Metadata, Viewport } from "next";

export const globalViewport: Viewport = {
  themeColor: "#09090b",
};

export const globalMetadata: Metadata = {
  metadataBase: new URL("https://slavecode.codes"), // Replace with your actual production URL
  title: {
    default: "SlaveCode | The Ultimate Platform for Software Engineers",
    template: "%s | SlaveCode",
  },
  description:
    "Master algorithms, system design, and interview prep. Join the ultimate all-in-one coding academy and real-time arena to prove your engineering excellence.",
  applicationName: "SlaveCode",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logos/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/logos/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logos/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logos/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/logos/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/logos/site.webmanifest",
  keywords: [
    "coding platform",
    "software engineering",
    "algorithms",
    "system design",
    "coding academy",
    "company interview prep",
    "data structures",
    "coding roadmap",
    "real-time coding arena",
    "competitive programming",
    "leetcode alternative",
    "leetcode",
    "neetcode",
    "codeforces",
    "hackerrank",
    "algoexpert",
    "codewars",
    "topcoder",
    "slavecode",
    "geeksforgeeks",
    "slavecode leetcode",
    "FAANG prep",
    "programming tutorials",
    "learn to code",
    "tech interviews",
    "dynamic programming",
    "graph algorithms",
    "frontend development",
    "backend development",
    "full stack engineer",
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "coding bootcamp",
    "developer portfolio",
    "code assessments",
    "problem solving",
  ],
  authors: [{ name: "phero20", url: "https://github.com/phero20/slavecode" }],
  creator: "phero20",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://slavecode.codes",
    title: "SlaveCode | The Ultimate Platform for Software Engineers",
    description: "Standardize your coding journey. From basic academy courses to advanced system design, company interviews, and real-time coding arenas.",
    siteName: "SlaveCode",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SlaveCode Cover Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SlaveCode | The Ultimate Platform for Software Engineers",
    description: "Standardize your coding journey. From basic academy courses to advanced system design, company interviews, and real-time coding arenas.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
    },
  },
};


