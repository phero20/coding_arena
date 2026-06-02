import React from 'react'
import { SystemDesignHomeSection } from './SystemDesignHomeSection'
import { SystemDesignWorkspaceDemo } from './SystemDesignWorkspaceDemo'

type Props = {}

function SystemdesignHome({ }: Props) {
    return (
        <div className='flex flex-col gap-10 py-20 sm:pt-28 sm:pb-36 border-b overflow-hidden bg-background'>

            {/* Centered System Design Header */}
            <div className="flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                    System Design
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-4xl">
                    Master system architecture with comprehensive learning modules. <br className="hidden sm:block" />
                    Dive deep into structured case studies and build real-world applications using our interactive workspace.
                </p>
            </div>

            <div className='mx-auto w-full max-w-7xl px-4 md:px-0 relative z-10 flex flex-col items-center gap-4'>
                <SystemDesignHomeSection />
                <SystemDesignWorkspaceDemo />
            </div>

        </div>
    )
}

export default SystemdesignHome