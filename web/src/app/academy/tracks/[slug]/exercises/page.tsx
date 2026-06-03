import { redirect } from "next/navigation";

export default async function ExercisesRedirectPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // In recent Next.js versions, params is a Promise that must be awaited
  const { slug } = await params;
  
  // Redirect the user back to the main track page
  redirect(`/academy/tracks/${slug}`);
}
