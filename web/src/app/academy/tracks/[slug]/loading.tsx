import { TrackDetailsSkeleton } from '@/components/skeletons/AcademySkeletons';
import { ScrollToTop } from '@/components/shared/ScrollToTop';

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScrollToTop />
      <TrackDetailsSkeleton />
    </div>
  );
}
