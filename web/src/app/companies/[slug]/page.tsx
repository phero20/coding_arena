import { redirect } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CompanyPage({ params }: PageProps) {
  redirect(`/companies/${params.slug}/problems`);
}
