"use client";

import { useState } from "react";
import { CompanyLogo } from "@/components/companies/CompanyLogo";

interface Props {
  imageUrl?: string;
  name: string;
}

export function CompanyLogoWithFallback({ imageUrl, name }: Props) {
  const [imgError, setImgError] = useState(false);

  if (!imageUrl || imgError) {
    return <CompanyLogo className="w-16 h-16 shrink-0" />;
  }

  return (
    <img width={100} height={100} 
      src={imageUrl} 
      alt={name} 
      onError={() => setImgError(true)}
      className="h-full w-full object-contain rounded-md"
    />
  );
}
