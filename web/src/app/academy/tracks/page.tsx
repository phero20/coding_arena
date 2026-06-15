import { getAcademyTracks } from "@/services/queries/academy.queries";
import { TracksHeader } from "@/components/academy/tracks/tracks-header";
import { AcademyTracksClient } from "@/components/academy/tracks/AcademyTracksClient";
import { ErrorDisplay } from "@/components/shared/StatusState";


export default async function AcademyTracksPage() {
  let tracks = [];
  
  try {
    tracks = await getAcademyTracks();
  } catch (error) {
    return (
      <ErrorDisplay 
        title="Failed to Load Tracks" 
        message="We couldn't retrieve the language tracks from the server. Please try again later."
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Full-width container for Header */}
      <div className="w-full border-b border-border/40 pt-24 pb-8 lg:pt-28 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TracksHeader 
            totalTracks={tracks?.length || 0} 
            sampleTracks={tracks?.slice(30, 43) || []} 
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <AcademyTracksClient tracks={tracks} />
      </div>
    </div>
  );
}
