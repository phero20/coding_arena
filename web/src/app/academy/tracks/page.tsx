"use client";

import { useState, useMemo } from "react";
import { useAcademyTracksQuery } from "@/hooks/queries/use-academy.queries";
import { useTracksFilter } from "@/hooks/use-tracks-filter";
import { TracksHeader } from "@/components/academy/tracks/tracks-header";
import { TracksToolbar } from "@/components/academy/tracks/tracks-toolbar";
import { TrackCard } from "@/components/academy/tracks/track-card";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { AcademyTracksSkeleton } from "@/components/skeletons";
import { SearchX } from "lucide-react";
import Link from "next/link";

export default function AcademyTracksPage() {
  const { data: tracks = [], isLoading, error } = useAcademyTracksQuery();
  
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedTags,
    setSelectedTags,
    allTags,
    filteredTracks,
  } = useTracksFilter(tracks);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Full-width container for Header */}
      <div className="w-full border-b border-border/40 pt-24 pb-8 lg:pt-24 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TracksHeader 
            totalTracks={tracks?.length || 0} 
            sampleTracks={tracks?.slice(30, 43) || []} 
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Toolbar Section */}
          <TracksToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalVisible={filteredTracks.length}
            allTags={allTags}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />

          {/* Content Section via QueryGuard */}
          <QueryGuard
            loading={isLoading}
            error={error}
            data={filteredTracks}
            skeleton={<AcademyTracksSkeleton />}
            errorTitle="Failed to load language tracks"
            emptyIcon={SearchX}
            emptyTitle="No tracks found"
            emptyMessage={`No programming languages match "${searchQuery}". Try a different term or clear your filters.`}
          >
            {(data) => (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {data.map((track) => (
                  <Link key={track.title} href={`/academy/tracks/${track.title}`} className="block focus:outline-none h-full">
                    <TrackCard track={track} />
                  </Link>
                ))}
              </div>
            )}
          </QueryGuard>
        </div>
      </div>
    </div>
  );
}
