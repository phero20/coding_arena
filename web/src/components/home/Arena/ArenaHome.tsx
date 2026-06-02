import React from 'react'
import { ArenaHomeSection } from './ArenaHomeSection'
import { ArenaHomeEditorSection } from './ArenaHomeEditorSection'

type Props = {}

function ArenaHome({ }: Props) {
    return (
        <div className='flex flex-col gap-10 py-20 sm:pt-28 sm:pb-36 border-b overflow-hidden bg-background'>

            {/* Centered Arena Header */}
            <div className="flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                    Arena
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-4xl">
                    Challenge your friends and developers worldwide. <br className="hidden sm:block" />
                    Engage in real-time coding matches, climb the leaderboards, and sharpen your competitive programming skills.
                </p>
            </div>

            <div className='mx-auto w-full max-w-7xl px-4 md:px-0 relative z-10 flex flex-col items-center gap-4'>
                <ArenaHomeSection />
                <ArenaHomeEditorSection />
            </div>

        </div>
    )
}

export default ArenaHome
