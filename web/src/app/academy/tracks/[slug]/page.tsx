"use client";

import React, { use, useEffect, useMemo, useState } from 'react';
import { useTrackConfigQuery, useSolvedExercisesQuery } from '@/hooks/queries/use-academy.queries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlugHeader } from '@/components/academy/tracks/slug/slug-header';
import { SlugAboutTab } from '@/components/academy/tracks/slug/slug-about-tab';
import { Info, LayoutGrid, Dumbbell, ArrowLeft } from "lucide-react";
import { SlugAboutContent } from '@/components/academy/tracks/slug/slug-about-content';
import { SlugAboutFeatures } from '@/components/academy/tracks/slug/slug-about-features';
import { SlugAboutGraphPreview } from '@/components/academy/tracks/slug/slug-about-graph-preview';
import { SlugAboutPracticePreview } from '@/components/academy/tracks/slug/slug-about-practice-preview';
import { SlugLearnTab } from '@/components/academy/tracks/learn/slug-learn-tab';
import { PracticeProblemsSection } from '@/components/academy/tracks/practice/practice-problem-card';
import { QueryGuard } from '@/components/shared/QueryGuard';
import { TrackDetailsSkeleton } from '@/components/skeletons/AcademySkeletons';
import { useRouter, useSearchParams } from 'next/navigation';

const Page = ({ params }: { params: Promise<{ slug: string }> }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { slug } = use(params);

    const { data: config, isLoading, error } = useTrackConfigQuery(slug);
    const { data: solvedExercises } = useSolvedExercisesQuery(slug);
    const allowedTabs = useMemo(() => new Set(['about', 'learn', 'practice']), []);
    const initialTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<string>(allowedTabs.has(initialTab ?? '') ? (initialTab as string) : 'about');

    useEffect(() => {
        const urlTab = searchParams.get('tab');
        if (urlTab && allowedTabs.has(urlTab) && urlTab !== activeTab) {
            setActiveTab(urlTab);
        }
    }, [activeTab, allowedTabs, searchParams]);

    const handleTabChange = (tab: string) => {
        const nextTab = allowedTabs.has(tab) ? tab : 'about';
        setActiveTab(nextTab);

        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('tab', nextTab);
        router.replace(`?${newParams.toString()}`, { scroll: false });
    };

    return (
        <QueryGuard
            loading={isLoading}
            error={error}
            data={config}
            skeleton={<TrackDetailsSkeleton />}
            errorTitle="Failed to Load Track"
            errorMessage="We couldn't retrieve the track information. Please refresh and try again."
        >
            {(config) => (
                <div className="flex flex-col min-h-screen bg-background py-24">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                {/* Top Header & Tabs Row */}
                <div className="w-full bg-background relative z-10 border-b">
                    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                        <SlugHeader config={config} />

                        <TabsList className="w-full justify-start border-none rounded-none h-auto p-0 bg-transparent gap-8 mt-1">
                            <TabsTrigger
                                value="back"
                                onClick={()=>router.push("/academy/tracks")}
                                className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" /> <span className='hidden md:block'>Back</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="about"
                                className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <Info className="h-5 w-5" /> <span className='hidden md:block'>About {config.language}</span>
                            </TabsTrigger>
                            {config.concepts && config.concepts.length > 0 && (
                                <TabsTrigger
                                    value="learn"
                                    className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
                                >
                                    <LayoutGrid className="h-5 w-5" /> Learn
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="practice"
                                className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <Dumbbell className="h-5 w-5" /> Practice
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                {/* Tab Contents */}
                <div className="w-full">
                    <TabsContent value="about" className="m-0 border-none p-0 focus-visible:ring-0">
                        <SlugAboutTab config={config} />
                        <SlugAboutContent content={config.about_content} language={config.language} />
                        <SlugAboutFeatures features={config.key_features} icon={config.icon_url} language={config.language} />
                        <SlugAboutGraphPreview config={config} />
                        <SlugAboutPracticePreview config={config} solvedExercises={solvedExercises || []} />
                    </TabsContent>

                    {config.concepts && config.concepts.length > 0 && (
                        <TabsContent value="learn" className="m-0 border-none p-0 focus-visible:ring-0 container mx-auto px-4 md:px-6 max-w-7xl mt-12 mb-24">
                            <SlugLearnTab config={config} solvedExercises={solvedExercises || []} />
                        </TabsContent>
                    )}

                    <TabsContent value="practice" className="m-0 border-none p-0 focus-visible:ring-0 container mx-auto px-4 md:px-6 max-w-7xl mt-12">
                        <PracticeProblemsSection exercises={config.exercises} solvedExercises={solvedExercises || []} />
                    </TabsContent>
                </div>
            </Tabs>
                </div>
            )}
        </QueryGuard>
    );
};

export default Page;
