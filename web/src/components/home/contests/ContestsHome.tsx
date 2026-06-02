import React from 'react'
import { ContestsHomeSection } from './ContestsHomeSection'

type Props = {}

function ContestsHome({ }: Props) {
    return (
        <div className='flex flex-col gap-10 py-20 sm:pt-28 border-b overflow-hidden bg-background'>

            {/* Centered Contests Header */}
            <div className="flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                    Global Contests
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-4xl">
                    Never miss a coding competition again. <br className="hidden sm:block" />
                    We aggregate contests from all major platforms into one unified calendar.
                </p>
            </div>

            <div className='mx-auto w-full max-w-7xl px-4 md:px-0 relative z-10 flex flex-col items-center gap-4'>
                <ContestsHomeSection />
            </div>

        </div>
    )
}

export default ContestsHome
