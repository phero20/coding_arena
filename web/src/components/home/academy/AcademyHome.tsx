import { AcademyHomeSection } from './AcademyHomeSection'
import { RoadmapPracticeHomeSection } from './RoadmapPracticeHomeSection'

type Props = {}

const AcademyHome = (props: Props) => {
    return (
        <div className='flex flex-col gap-10 py-20 sm:py-28 border-y overflow-hidden'>

            {/* Centered Academy Header */}
            <div className="flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                    Academy
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-4xl">
                    Perfect for beginners. Take your skills from basic to master 
                    across dozens <br className="hidden sm:block" />of languages, complete with structured roadmaps, detailed concepts, and hands-on practice problems.
                </p>
            </div>
            <div className='flex flex-col gap-0 md:gap-20'>
                <AcademyHomeSection />
                <RoadmapPracticeHomeSection />
            </div>

        </div>
    )
}

export default AcademyHome;