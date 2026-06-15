import { getLeaderboard } from "@/services/queries/stats.queries";
import { LeaderboardClient } from "@/components/stats/leaderboard/LeaderboardClient";
import { ErrorDisplay } from "@/components/shared/StatusState";



export default async function LeaderboardPage() {
  let initialData;
  
  try {
    // Fetch the top 50 users for perfect SEO and instant initial paint
    initialData = await getLeaderboard(50, 0);
  } catch (error) {
    return (
      <div className="pt-32 min-h-screen bg-background">
        <ErrorDisplay 
          title="Leaderboard Unavailable" 
          message="We couldn't retrieve the global rankings. Please try again later."
        />
      </div>
    );
  }

  return <LeaderboardClient initialData={initialData} />;
}
