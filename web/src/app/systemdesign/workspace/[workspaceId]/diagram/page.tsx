import { redirect } from 'next/navigation';

export default async function DiagramRootPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  
  // If a user navigates to just /diagram without an ID, instantly bounce them back to the workspace!
  redirect(`/systemdesign/workspace/${workspaceId}`);
}
