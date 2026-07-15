"use client";

import dynamic from "next/dynamic";
import ExerciseSkeleton from "@/app/academy/tracks/[slug]/exercises/[exerciseSlug]/ExerciseSkeleton";
import { type ComponentProps } from "react";

// Dynamically import the heavy editor workspace with ssr disabled
const AcademyWorkspace = dynamic(
  () => import("./AcademyWorkspace").then((mod) => mod.AcademyWorkspace),
  { 
    ssr: false,
    loading: () => <ExerciseSkeleton />
  }
);

// We need to extract the props type from AcademyWorkspace
// However, to keep it simple, we can just pass any props to it
export function AcademyWorkspaceWrapper(props: any) {
  return <AcademyWorkspace {...props} />;
}
