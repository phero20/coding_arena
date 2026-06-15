import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CompanyPage({ params }: PageProps) {
  const resolvedParams = await params;
  redirect(`/companies/${resolvedParams.slug}/problems`);
}
