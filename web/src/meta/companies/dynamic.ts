import type { Metadata } from "next";

export async function generateCompanyMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const companyName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    title: `${companyName} Interview Questions`,
    description: `Master the most frequently asked coding problems and interview questions for ${companyName}.`,
    openGraph: {
      title: `${companyName} Interview Questions | SlaveCode`,
      description: `Master the most frequently asked coding problems and interview questions for ${companyName}.`,
    },
  };
}
