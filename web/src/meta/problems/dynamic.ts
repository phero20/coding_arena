import type { Metadata } from "next";

export async function generateProblemMetadata({ params }: { params: Promise<{ problemId: string }> }): Promise<Metadata> {
  const { problemId } = await params;
  
  // Generate title from the URL parameter instead of hitting the DB
  const problemTitle = problemId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    title: `${problemTitle} | Practice Problems`,
    description: `Solve the ${problemTitle} coding problem on SlaveCode. Master algorithms and data structures.`,
    openGraph: {
      title: `${problemTitle} | SlaveCode Practice`,
      description: `Solve the ${problemTitle} coding problem on SlaveCode. Master algorithms and data structures.`,
    },
  };
}
