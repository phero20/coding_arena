import type { Metadata } from "next";

export async function generateLearnMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    title: `${title} | System Design`,
    description: `Learn about ${title} and master scalable system architecture principles.`,
    openGraph: {
      title: `${title} | Learn System Design`,
      description: `Learn about ${title} and master scalable system architecture principles.`,
    },
  };
}

export async function generateWorkspaceMetadata({ params }: { params: Promise<{ workspaceId: string }> }): Promise<Metadata> {
  const { workspaceId } = await params;
  
  return {
    title: `Architecture Workspace | System Design`,
    description: `Interactive system design architecture workspace. ID: ${workspaceId.substring(0, 8)}`,
    openGraph: {
      title: `Architecture Workspace | SlaveCode`,
      description: `Interactive system design architecture workspace.`,
    },
  };
}
