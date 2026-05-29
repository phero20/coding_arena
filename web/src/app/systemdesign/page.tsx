"use client";

import Link from "next/link";
import { FolderKanban, BookOpen, Info } from "lucide-react";
import { SystemDesignIcon } from "@/components/systemdesign-workspace/about/system-design-icon";
import { SystemDesignAbout } from "@/components/systemdesign-workspace/about/system-design-about";
import {
    HexDatabaseIcon,
    HexLoadBalancerIcon,
    HexCacheIcon,
    HexMessageQueueIcon,
    HexApiGatewayIcon,
    HexServerIcon,
    HexCdnIcon,
    HexStorageIcon
} from "@/components/systemdesign-workspace/about/system-design-icons";

const HEX_ICONS = [
    { Component: HexDatabaseIcon, name: "Database" },
    { Component: HexLoadBalancerIcon, name: "Load Balancer" },
    { Component: HexCacheIcon, name: "Cache" },
    { Component: HexCdnIcon, name: "CDN" },
    { Component: HexServerIcon, name: "Microservices" },
    { Component: HexMessageQueueIcon, name: "Message Queue" },
    { Component: HexApiGatewayIcon, name: "API Gateway" },
    { Component: HexStorageIcon, name: "Blob Storage" },
];

export default function SystemDesignHubPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background py-20">
            <div className="space-y-8">

                {/* Creative Centered Header */}
                <header className="flex flex-col items-center justify-center text-center space-y-12 py-8">

                    {/* Overlapping Hexagon Arc */}
                    <div className="flex items-center justify-center -space-x-4 sm:-space-x-5">
                        {HEX_ICONS.map((icon, i) => (
                            <div
                                key={icon.name}
                                className="relative"
                                style={{
                                    zIndex: 10 - Math.floor(Math.abs(3.5 - i)),
                                    transform: `translateY(${Math.pow(i - 3.5, 2) * 2.5}px)`
                                }}
                                title={icon.name}
                            >
                                <icon.Component className="h-14 w-14 sm:h-20 sm:w-20 object-contain drop-shadow-sm" />
                            </div>
                        ))}
                    </div>

                    {/* Typography */}
                    <div className="space-y-4 max-w-3xl flex flex-col items-center px-4 sm:px-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
                            <span className="text-primary">56 topics</span> for you to master
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                            Master the art of architecting scalable, distributed systems through our curated curriculum and put them into practice with interactive whiteboard workspaces.
                        </p>
                    </div>
                </header>

                {/* Clean Link Navigation (mimicking tabs) */}
                <nav className="px-4 sm:px-6 lg:px-8 flex w-full bg-background relative z-10 border-b">
                    <div className="mx-auto max-w-7xl w-full flex gap-8">
                        <Link
                            href="/systemdesign"
                            className="border-b-[3px] border-primary text-primary px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2"
                        >
                            <Info className="h-5 w-5" />
                            <span className="hidden md:block">About System Design</span>
                        </Link>


                        <Link
                            href="/systemdesign/learn"
                            className="border-b-[3px] border-transparent text-muted-foreground hover:text-foreground px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2"
                        >
                            <BookOpen className="h-5 w-5" />
                            Learn
                        </Link>

                        <Link
                            href="/systemdesign/workspace"
                            className="border-b-[3px] border-transparent text-muted-foreground hover:text-foreground px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2"
                        >
                            <FolderKanban className="h-5 w-5" />
                            Workspaces
                        </Link>

                    </div>
                </nav>

                {/* Hero Content (About) */}
                <SystemDesignAbout />

            </div>
        </div>
    );
}
