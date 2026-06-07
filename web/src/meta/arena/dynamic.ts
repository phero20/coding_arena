import type { Metadata } from "next";

export async function generateLobbyMetadata({ params }: { params: Promise<{ roomId: string }> }): Promise<Metadata> {
  const { roomId } = await params;
  return {
    title: `Arena Lobby: ${roomId}`,
    description: `Join the private coding arena lobby: ${roomId}.`,
    openGraph: {
      title: `Arena Lobby: ${roomId} | SlaveCode`,
      description: `Join the private coding arena lobby: ${roomId}.`,
    },
  };
}

export async function generateMatchMetadata({ params }: { params: Promise<{ roomId: string }> }): Promise<Metadata> {
  const { roomId } = await params;
  return {
    title: `Live Match: ${roomId}`,
    description: `Spectate or compete in the live coding match: ${roomId}.`,
    openGraph: {
      title: `Live Match: ${roomId} | SlaveCode`,
      description: `Spectate or compete in the live coding match: ${roomId}.`,
    },
  };
}

export async function generateResultsMetadata({ params }: { params: Promise<{ roomId: string }> }): Promise<Metadata> {
  const { roomId } = await params;
  return {
    title: `Match Results: ${roomId}`,
    description: `View the final leaderboard and results for match ${roomId}.`,
    openGraph: {
      title: `Match Results: ${roomId} | SlaveCode`,
      description: `View the final leaderboard and results for match ${roomId}.`,
    },
  };
}
