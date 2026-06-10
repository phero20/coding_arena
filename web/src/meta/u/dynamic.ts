import type { Metadata } from "next";

export async function generateUserMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  
  return {
    title: `${username} | Developer Profile`,
    description: `Check out ${username}'s competitive programming profile, solved problems, and global ranking on SlaveCode.`,
    alternates: { canonical: `/u/${username}` },
    openGraph: {
      title: `${username} | SlaveCode Profile`,
      description: `Check out ${username}'s competitive programming profile, solved problems, and global ranking on SlaveCode.`,
    },
  };
}
