import { Container } from "@/components/shared/Container";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { ProfileWrapper } from "@/components/profile/ProfileWrapper";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

/**
 * ProfilePage (Server Component)
 * Serves as the entry point for /u/[username].
 * Orchestration is handled by the ProfileWrapper Client Component.
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  return (
    <main className="pt-24 pb-20 overflow-hidden bg-background">
      <Container>
        <div className="flex flex-col gap-10">
          <ProfileWrapper username={username} />
        </div>
      </Container>
    </main>
  );
}
