"use client";

import {
    Cloud, ChevronDown, Undo2, Redo2, Download, Upload, Share2,
    Search, Sparkles, Code2, LayoutTemplate, Shapes, Image as ImageIcon,
    Smartphone, Hash, Braces, MousePointer2, Hand, Pen, Eraser,
    ArrowRight, Type, Square, Frame, Menu, ArrowLeft,
    Plus,
    Layers,
    MoveRight,
    ChevronRight
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const SystemDesignWorkspaceDemo = () => {
    return (
        <Card className="relative w-full border border-border/40 border-none bg-background flex flex-col h-[700px] mt-12 md:mt-24 pointer-events-none opacity-90 shadow-none">
            {/* Top Navbar */}
            <div className="h-14 shrink-0 border-b border-border/40 flex items-center justify-between px-4 bg-card rounded-t-xl">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="gap-2 text-muted-foreground h-8 px-2">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden md:flex ">Back</span>
                    </Button>
                    <div className="w-px h-4 bg-border/40" />
                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                        <span className="font-bold text-foreground">Design</span>
                        <div className="flex items-center gap-1.5 text-xs">
                            <Cloud className="w-4 h-4 text-primary" />
                            <span>Saved</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                            <Undo2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                            <Redo2 className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="hidden sm:flex items-center gap-2 ">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-2 font-medium text-muted-foreground">
                            <Upload className="w-3.5 h-3.5" /> <span className="hidden md:flex ">Import</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-2 font-medium text-muted-foreground">
                            <Download className="w-3.5 h-3.5" /> <span className="hidden md:flex ">Export</span>
                        </Button>
                        <Button size="sm" className="h-8 px-4 text-xs gap-2 font-bold">
                            <Share2 className="w-3.5 h-3.5" /> <span className="hidden md:flex ">Share</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Body */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left Icon Sidebar */}
                <div className="w-14 shrink-0 border-r border-border flex flex-col items-center py-4 gap-4 bg-card">
                    <Button variant="ghost" size="icon" className=" text-foreground bg-secondary">
                        <Plus className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className=" text-foreground">
                        <Layers className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-foreground">
                        <Sparkles className="w-5 h-5" />
                    </Button>
                </div>

                {/* Left Menu Sidebar */}
                <div className="hidden md:flex w-[280px] shrink-0 border-r border-border flex-col bg-card">
                    <div className="p-2 border-b border-border/40 flex items-center justify-between text-muted-foreground text-xs font-semibold tracking-wider">
                        INSERT
                        <Menu className="w-4 h-4" />
                    </div>

                    <div className="p-2 flex flex-col gap-2 overflow-y-hidden">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <div className="w-full bg-background border border-border/40 rounded-md py-2 pl-9 pr-4 text-xs text-muted-foreground">
                                Search templates, logos, icons...
                            </div>
                        </div>

                        <div className="text-[10px] font-bold text-muted-foreground tracking-wider">
                            ALL CATEGORIES
                        </div>

                        <div className="flex flex-col gap-2">
                            <Card className="flex items-center justify-between p-3  border-border bg-background shadow-none">
                                <div className="flex gap-3 items-center">
                                    <Sparkles className="w-5 h-5 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground">AI Chat</span>
                                        <span className="text-[10px] text-muted-foreground">Generate diagrams with AI</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Card>

                            <Card className="flex items-center justify-between p-3  border-border bg-background shadow-none">
                                <div className="flex gap-3 items-center">
                                    <Code2 className="w-5 h-5 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground">Diagram as Code</span>
                                        <span className="text-[10px] text-muted-foreground">Create diagrams using code</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Card>

                            <Card className="flex items-center justify-between p-3  border-border bg-background shadow-none">
                                <div className="flex gap-3 items-center">
                                    <LayoutTemplate className="w-5 h-5 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground">Diagram Catalog</span>
                                        <span className="text-[10px] text-muted-foreground">A catalog of 100+ templates</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Card>

                            <Card className="flex items-center justify-between p-3  border-border bg-background shadow-none">
                                <div className="flex gap-3 items-center">
                                    <Shapes className="w-5 h-5 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground">Shape</span>
                                        <span className="text-[10px] text-muted-foreground">Explore our various shapes</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Card>

                            <Card className="flex items-center justify-between p-3  border-border bg-background shadow-none">
                                <div className="flex gap-3 items-center">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground">Icon</span>
                                        <span className="text-[10px] text-muted-foreground">3,900+ icons available</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Card>

                            <Card className="flex items-center justify-between p-3 border-border bg-background shadow-none">
                                <div className="flex gap-3 items-center">
                                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground">Device Frame</span>
                                        <span className="text-[10px] text-muted-foreground">Phone, tablet, browser frames</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Card>
                        </div>

                        {/* Bottom Grid Tools */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                            <Card className="flex flex-col items-center justify-center gap-2 p-3 bg-background  border-border shadow-none">
                                <Hash className="w-5 h-5 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground font-medium">Figure</span>
                            </Card>
                            <Card className="flex flex-col items-center justify-center gap-2 p-3 bg-background  border-border shadow-none">
                                <Braces className="w-5 h-5 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground font-medium">Code Block</span>
                            </Card>
                            <Card className="flex flex-col items-center justify-center gap-2 p-3 bg-background border-border shadow-none">
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground font-medium">Image</span>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 relative bg-zinc-950 overflow-hidden">


                    {/* Canvas Tools Overlay */}
                    <div className="absolute top-0 left-0 right-4 flex justify-between z-20">
                        {/* Page Selector */}
                        <Card className="flex items-center gap-2 bg-zinc-900 border-border/40 px-3 py-1.5 rounded-none shadow-none rounded-r">
                            <Menu className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">Page 1</span>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        </Card>

                        {/* Zoom Slider */}
                        <Card className="flex items-center gap-3 bg-zinc-900 border-border/40 px-4 py-2 rounded-full mt-3 shadow-none">
                            <div className="w-24 h-1 bg-zinc-700 rounded-full relative">
                                <div className="absolute left-0 top-0 bottom-0 w-3/4 bg-blue-500 rounded-full" />
                                <div className="absolute left-3/4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-2 border-white rounded-full" />
                            </div>
                        </Card>
                    </div>

                    {/* Floating Tool Palette */}
                    <Card className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-900 border-border p-1.5 flex flex-col gap-1 z-20 shadow-none">
                        <Button size="icon" className="w-8 h-8  bg-blue-500 hover:bg-blue-600 text-white shadow-none"><MousePointer2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8  text-muted-foreground"><Hand className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8  text-muted-foreground"><Pen className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8  text-muted-foreground"><Eraser className="w-4 h-4" /></Button>
                        <div className="w-6 h-px bg-border/40 mx-auto my-1" />
                        <Button variant="ghost" size="icon" className="w-8 h-8  text-muted-foreground"><ArrowRight className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8  text-muted-foreground"><Type className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8  text-muted-foreground"><Square className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8  text-muted-foreground"><ImageIcon className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8  text-muted-foreground"><Frame className="w-4 h-4" /></Button>
                    </Card>

                    {/* FAKE DIAGRAM - Actual Architecture using SVGs */}
                    <div className="absolute inset-0 flex items-center justify-center p-8 overflow-hidden z-10 mt-10">
                        <div className="relative w-[1150px] h-[550px] scale-50 sm:scale-75 md:scale-90 lg:scale-100 origin-center">
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                <defs>
                                    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                                        <polygon points="0 0, 8 4, 0 8" fill="#d4d4d8" />
                                    </marker>
                                </defs>

                                {/* Lines */}
                                <path d="M 120 370 C 160 370, 170 370, 200 370" stroke="#d4d4d8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" /> {/* API to Lambda */}
                                <path d="M 280 370 C 330 370, 360 370, 420 370" stroke="#d4d4d8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" /> {/* Lambda to Server */}
                                <path d="M 500 370 C 530 370, 560 370, 600 370" stroke="#d4d4d8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" /> {/* Server to Data */}
                                <path d="M 480 340 C 510 250, 550 180, 590 160" stroke="#d4d4d8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" /> {/* Server to Queue */}

                                <path d="M 680 150 C 730 140, 770 90, 830 70" stroke="#d4d4d8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" /> {/* Queue to Worker3 */}
                                <path d="M 680 160 C 730 160, 780 170, 830 170" stroke="#d4d4d8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" /> {/* Queue to Worker2 */}
                                <path d="M 680 170 C 730 200, 770 260, 830 270" stroke="#d4d4d8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" /> {/* Queue to Worker1 */}

                                <path d="M 910 170 C 950 190, 990 220, 1030 240" stroke="#d4d4d8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" /> {/* Worker2 to Analytics */}
                                <path d="M 680 390 C 730 420, 780 460, 830 470" stroke="#d4d4d8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" /> {/* Data to S3 */}
                            </svg>

                            {/* Frames */}
                            <div className="absolute border-[1.5px] border-dashed border-zinc-700/60 rounded-md z-0" style={{ left: 380, top: 0, width: 750, height: 530 }}>
                                <div className="text-xs font-semibold text-zinc-400 p-3">VPC Subnet</div>
                            </div>
                            <div className="absolute border-[1.5px] border-dashed border-zinc-700/60 rounded-md z-0" style={{ left: 400, top: 270, width: 330, height: 200 }}>
                                <div className="text-xs font-semibold text-zinc-400 p-3">Main Server</div>
                            </div>
                            <div className="absolute border-[1.5px] border-dashed border-zinc-700/60 rounded-md z-0" style={{ left: 810, top: 20, width: 140, height: 320 }}>
                                <div className="text-xs font-semibold text-zinc-400 p-3">Compute Nodes</div>
                            </div>

                            {/* Nodes */}
                            <div className="absolute flex flex-col items-center gap-1.5 z-10" style={{ left: 50, top: 340, width: 80 }}>
                                <img src="/assets/diagram/system/arch_amazon-api-gateway_48.svg" alt="API gateway" className="w-[44px] h-[44px] object-contain drop-shadow-lg" />
                                <span className="text-[10px] font-bold text-zinc-100 font-mono tracking-tight">API gateway</span>
                            </div>

                            <div className="absolute flex flex-col items-center gap-1.5 z-10" style={{ left: 210, top: 340, width: 80 }}>
                                <img src="/assets/diagram/system/arch_aws-lambda_48.svg" alt="Lambda" className="w-[44px] h-[44px] object-contain drop-shadow-lg" />
                                <span className="text-[10px] font-bold text-zinc-100 font-mono tracking-tight">Lambda</span>
                            </div>

                            <div className="absolute flex flex-col items-center gap-1.5 z-10" style={{ left: 430, top: 340, width: 80 }}>
                                <img src="/assets/diagram/system/arch_amazon-ec2_48.svg" alt="Server" className="w-[44px] h-[44px] object-contain drop-shadow-lg" />
                                <span className="text-[10px] font-bold text-zinc-100 font-mono tracking-tight">Server</span>
                            </div>

                            <div className="absolute flex flex-col items-center gap-1.5 z-10" style={{ left: 610, top: 340, width: 80 }}>
                                <img src="/assets/diagram/system/arch_amazon-rds_48.svg" alt="Data" className="w-[44px] h-[44px] object-contain drop-shadow-lg" />
                                <span className="text-[10px] font-bold text-zinc-100 font-mono tracking-tight">Data</span>
                            </div>

                            <div className="absolute flex flex-col items-center gap-1.5 z-10" style={{ left: 600, top: 130, width: 80 }}>
                                <img src="/assets/diagram/system/arch_amazon-simple-queue-service_48.svg" alt="Queue" className="w-[44px] h-[44px] object-contain drop-shadow-lg" />
                                <span className="text-[10px] font-bold text-zinc-100 font-mono tracking-tight">Queue</span>
                            </div>

                            <div className="absolute flex flex-col items-center gap-1.5 z-10 mt-4" style={{ left: 840, top: 40, width: 80 }}>
                                <img src="/assets/diagram/system/arch_amazon-ec2_48.svg" alt="Worker3" className="w-[44px] h-[44px] object-contain drop-shadow-lg" />
                                <span className="text-[10px] font-bold text-zinc-100 font-mono tracking-tight">Worker1</span>
                            </div>

                            <div className="absolute flex flex-col items-center gap-1.5 z-10 mt-2" style={{ left: 840, top: 140, width: 80 }}>
                                <img src="/assets/diagram/system/arch_amazon-ec2_48.svg" alt="Worker2" className="w-[44px] h-[44px] object-contain drop-shadow-lg" />
                                <span className="text-[10px] font-bold text-zinc-100 font-mono tracking-tight">Worker2</span>
                            </div>

                            <div className="absolute flex flex-col items-center gap-1.5 z-10" style={{ left: 840, top: 240, width: 80 }}>
                                <img src="/assets/diagram/system/arch_amazon-ec2_48.svg" alt="Worker1" className="w-[44px] h-[44px] object-contain drop-shadow-lg" />
                                <span className="text-[10px] font-bold text-zinc-100 font-mono tracking-tight">Worker1</span>
                            </div>

                            <div className="absolute flex flex-col items-center gap-1.5 z-10" style={{ left: 840, top: 440, width: 80 }}>
                                <img src="/assets/diagram/system/arch_amazon-simple-storage-service_48.svg" alt="S3" className="w-[44px] h-[44px] object-contain drop-shadow-lg" />
                                <span className="text-[10px] font-bold text-zinc-100 font-mono tracking-tight">S3</span>
                            </div>

                            <div className="absolute flex flex-col items-center gap-1.5 z-10" style={{ left: 1040, top: 220, width: 80 }}>
                                <img src="/assets/diagram/system/arch_amazon-athena_48.svg" alt="Analytics" className="w-[44px] h-[44px] object-contain drop-shadow-lg" />
                                <span className="text-[10px] font-bold text-zinc-100 font-mono tracking-tight">Analytics</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Features & CTA Overlay */}
            <div className="absolute inset-x-0 -bottom-20 flex flex-col items-center justify-end bg-gradient-to-t from-background via-background/95 to-transparent pt-60 pb-12 z-30 pointer-events-auto">
                <h3 className="text-2xl text-center font-bold text-foreground mb-4 tracking-tight">
                    Master Architecture with Professional Tools
                </h3>
                <p className="text-foreground/80 text-sm text-center max-w-3xl leading-relaxed mb-6">
                    The interactive workspace gives you ultimate control to draw and learn. Access <span className="text-foreground font-medium underline decoration-primary underline-offset-4">3,900+ architecture icons</span>, generate architectures via <span className="text-foreground font-medium underline decoration-primary underline-offset-4">Code-to-Diagram</span>, utilize <span className="text-foreground font-medium underline decoration-primary underline-offset-4">AI design assistance</span>, and explore a massive <span className="text-foreground font-medium underline decoration-primary underline-offset-4">pre-built diagram catalog</span>.
                </p>
                <Button
                    variant="link"
                    className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
                    asChild
                >
                    <Link href="/systemdesign">
                        Explore Workspace  <ArrowRight className="w-5 h-5" />
                    </Link>
                </Button>
            </div>
        </Card>
    );
};
