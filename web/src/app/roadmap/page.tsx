import { RoadmapClient } from "@/components/roadmap/RoadmapClient";
import { getTaxonomyTree } from "@/services/queries/taxonomy.queries";
import type { CategoryTreeNode } from "@/types/taxonomy";



export default async function RoadmapPage() {
  let initialTreeData: CategoryTreeNode[] = [];

  try {
    // Pre-fetch the static taxonomy tree on the server for instant painting
    initialTreeData = await getTaxonomyTree();
  } catch (error) {
    console.error("Failed to fetch taxonomy tree during SSR:", error);
  }

  return <RoadmapClient initialTreeData={initialTreeData} />;
}