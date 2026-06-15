import React from 'react';
import { getTrackConfig } from '@/services/queries/academy.queries';
import { TrackOverviewTabs } from '@/components/academy/tracks/TrackOverviewTabs';
import { ErrorDisplay } from '@/components/shared/StatusState';
import { cache } from 'react';

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



const Page = async ({ params }: Props) => {
    const resolvedParams = await params;
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
};

export default Page;
