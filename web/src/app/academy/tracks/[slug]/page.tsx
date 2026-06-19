import React, { Suspense } from 'react';
import { getTrackConfig } from '@/services/queries/academy.queries';
import { TrackOverviewTabs } from '@/components/academy/tracks/TrackOverviewTabs';
import { ErrorDisplay } from '@/components/shared/StatusState';
import { cache } from 'react';
import TrackSkeleton from './TrackSkeleton';

export { generateTrackMetadata as generateMetadata } from "@/meta/academy/dynamic";

const getConfig = cache(async (slug: string) => {
    try {
        return await getTrackConfig(slug);
    } catch (error) {
        return null;
    }
});

type Props = {
    params: Promise<{ slug: string }>;
};

async function TrackData({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
    const resolvedParams = await paramsPromise;
    const config = await getConfig(resolvedParams.slug);

    if (!config) {
        return (
            <ErrorDisplay 
                title="Failed to Load Track" 
                message="We couldn't retrieve the track information. Please check the URL and try again." 
            />
        );
    }

    return (
        <TrackOverviewTabs config={config} slug={resolvedParams.slug} />
    );
}

export default function Page({ params }: Props) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Suspense fallback={<TrackSkeleton />}>
                <TrackData paramsPromise={params} />
            </Suspense>
        </div>
    );
}
