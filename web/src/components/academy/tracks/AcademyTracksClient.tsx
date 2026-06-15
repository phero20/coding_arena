"use client";

import { useTracksFilter } from "@/hooks/use-tracks-filter";
import { TracksToolbar } from "@/components/academy/tracks/tracks-toolbar";
import { TrackCard } from "@/components/academy/tracks/track-card";
import { SearchX } from "lucide-react";
import Link from "next/link";
import type { Track } from "@/types/academy";

interface AcademyTracksClientProps {
  tracks: Track[];
}

export function AcademyTracksClient({ tracks }: AcademyTracksClientProps) {
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
    <div className="space-y-8">
      {/* Toolbar Section */}
      <TracksToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        allTags={allTags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />

      {/* Content Section */}
      {filteredTracks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredTracks.map((track) => (
            <Link key={track.slug} href={`/academy/tracks/${track.slug}`} className="block focus:outline-none h-full">
              <TrackCard track={track} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center mt-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <SearchX className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
            No tracks found
          </h3>
          <p className="text-muted-foreground max-w-md">
            No programming languages match "{searchQuery}". Try a different term or clear your filters.
          </p>
        </div>
      )}
    </div>
  );
}
