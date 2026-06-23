"use client";

import type { Company } from "@/types/company";
import Link from "next/link";
import { useState } from "react";

interface CompaniesHeaderProps {
  totalCompanies: number;
  sampleCompanies: Company[];
  as?: 'h1' | 'h2';
}

export function CompaniesHeader({ totalCompanies, sampleCompanies, as = 'h1' }: CompaniesHeaderProps) {
  const Heading = as;
  return (
    <section className="flex flex-col items-center justify-center text-center space-y-12">
      {/* Overlapping Hexagon Icons (fallback applied if image fails) */}
      {sampleCompanies.length > 0 && (
        <div className="flex items-center justify-center -space-x-5 sm:-space-x-6">
          {sampleCompanies.slice(0, 8).map((company, i) => (
            <Link 
              href={`/companies/${company.slug}/problems`}
              key={company.id}
              className="relative transition-transform cursor-pointer "
              style={{ 
                zIndex: 10 - Math.floor(Math.abs(3.5 - i)),
                transform: `translateY(${Math.pow(i - 3.5, 2) * 2}px)`
              }}
              aria-label={company.name}
            >
              <CompanyIcon company={company} index={i} />
            </Link>
          ))}
        </div>
      )}

      {/* Typography */}
      <div className="space-y-4 max-w-3xl flex flex-col items-center">
        <Heading className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
          <span className="text-primary">{totalCompanies} companies</span> for you to master
        </Heading>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Master your preferred company questions through curated, 
          structured learning tracks designed for deliberate practice.
        </p>
      </div>
    </section>
  );
}

const svgColors = [
  { c1: "#f97316", c2: "#ea580c" }, // Orange
  { c1: "#8b5cf6", c2: "#6d28d9" }, // Purple
  { c1: "#3b82f6", c2: "#2563eb" }, // Blue
  { c1: "#10b981", c2: "#059669" }, // Green
  { c1: "#f43f5e", c2: "#e11d48" }, // Rose
  { c1: "#eab308", c2: "#ca8a04" }, // Yellow
  { c1: "#06b6d4", c2: "#0891b2" }, // Cyan
  { c1: "#ec4899", c2: "#be185d" }, // Pink
];

function CompanyIcon({ company, index }: { company: Company; index: number }) {
  const [imgError, setImgError] = useState(false);
  
  const colors = svgColors[index % svgColors.length];
  const gradientId = `hex-grad-${company.id}`;

  return (
    <div className="relative h-14 w-14 sm:h-[5.3rem] sm:w-[5.3rem] object-contain drop-shadow-sm flex items-center justify-center">
      {/* Background SVG Hexagon */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.c1} />
            <stop offset="100%" stopColor={colors.c2} />
          </linearGradient>
        </defs>
        <path
          d="M50 4.8 C51.7 4.8 53.1 5.5 54.2 6.6 L85.5 26 C87.7 27.4 89.1 30 89.1 32.8 L89.1 67.2 C89.1 70 87.7 72.6 85.5 74 L54.2 93.4 C53.1 94.5 51.7 95.2 50 95.2 C48.3 95.2 46.9 94.5 45.8 93.4 L14.5 74 C12.3 72.6 10.9 70 10.9 67.2 L10.9 32.8 C10.9 30 12.3 27.4 14.5 26 L45.8 6.6 C46.9 5.5 48.3 4.8 50 4.8 Z"
          fill="#ffffff"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Foreground Image/Fallback */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-[20%]">
        {imgError ? (
          <div className="text-2xl sm:text-3xl font-bold text-black opacity-70">
            {company.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <img width={100} height={100}
            src={company.imageUrl}
            alt={company.name}
            onError={() => setImgError(true)}
            className="w-[80%] object-contain"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
