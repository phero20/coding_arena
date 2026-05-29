import React from "react";

interface IconProps {
  className?: string;
}

interface HexagonBaseProps extends IconProps {
  gradientId: string;
  color1: string;
  color2: string;
  children: React.ReactNode;
}

const HexagonBase = ({ children, className, gradientId, color1, color2 }: HexagonBaseProps) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color1} />
        <stop offset="100%" stopColor={color2} />
      </linearGradient>
      <filter id={`${gradientId}-shadow`} x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.15" />
      </filter>
    </defs>

    {/* Hexagon shape (Mathematically perfect regular hexagon) */}
    <path
      d="M50 4.8 C51.7 4.8 53.1 5.5 54.2 6.6 L85.5 26 C87.7 27.4 89.1 30 89.1 32.8 L89.1 67.2 C89.1 70 87.7 72.6 85.5 74 L54.2 93.4 C53.1 94.5 51.7 95.2 50 95.2 C48.3 95.2 46.9 94.5 45.8 93.4 L14.5 74 C12.3 72.6 10.9 70 10.9 67.2 L10.9 32.8 C10.9 30 12.3 27.4 14.5 26 L45.8 6.6 C46.9 5.5 48.3 4.8 50 4.8 Z"
      fill="#ffffff"
      stroke={`url(#${gradientId})`}
      strokeWidth="4"
      strokeLinejoin="round"
      filter={`url(#${gradientId}-shadow)`}
    />

    {/* Inner content container */}
    <g transform="translate(20, 20) scale(0.6)">
      {children}
    </g>
  </svg>
);

export const HexDatabaseIcon = ({ className }: IconProps) => (
  <HexagonBase className={className} gradientId="hex-db" color1="#f97316" color2="#ea580c">
    <ellipse cx="50" cy="25" rx="35" ry="12" fill="url(#hex-db)" opacity="1" />
    <path d="M 15 25 L 15 50 C 15 65, 85 65, 85 50 L 85 25" fill="url(#hex-db)" opacity="0.7" />
    <path d="M 15 50 L 15 75 C 15 90, 85 90, 85 75 L 85 50" fill="url(#hex-db)" opacity="0.4" />
  </HexagonBase>
);

export const HexLoadBalancerIcon = ({ className }: IconProps) => (
  <HexagonBase className={className} gradientId="hex-lb" color1="#8b5cf6" color2="#6d28d9">
    <rect x="20" y="45" width="60" height="35" rx="6" fill="url(#hex-lb)" opacity="0.3" />
    <path d="M 50 10 L 50 30 M 50 30 L 30 30 M 30 30 L 30 35 M 50 30 L 70 30 M 70 30 L 70 35" stroke="url(#hex-lb)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M 23 35 L 37 35 L 30 45 Z" fill="url(#hex-lb)" />
    <path d="M 63 35 L 77 35 L 70 45 Z" fill="url(#hex-lb)" />
  </HexagonBase>
);

export const HexCacheIcon = ({ className }: IconProps) => (
  <HexagonBase className={className} gradientId="hex-cache" color1="#10b981" color2="#059669">
    {/* Database shape to represent storage */}
    <ellipse cx="50" cy="35" rx="28" ry="10" fill="url(#hex-cache)" opacity="1" />
    <path d="M 22 35 L 22 65 C 22 75, 78 75, 78 65 L 78 35" fill="url(#hex-cache)" opacity="0.4" />

    {/* Lightning bolt overlay for speed/cache */}
    <path d="M 55 15 L 35 55 L 50 55 L 45 85 L 70 45 L 55 45 Z" fill="url(#hex-cache)" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
  </HexagonBase>
);

export const HexMessageQueueIcon = ({ className }: IconProps) => (
  <HexagonBase className={className} gradientId="hex-mq" color1="#f43f5e" color2="#e11d48">
    {/* Queue Channel */}
    <path d="M 10 30 L 90 30 M 10 70 L 90 70" stroke="url(#hex-mq)" strokeWidth="4" strokeLinecap="round" opacity="0.3" />

    {/* Envelope 1 */}
    <g transform="translate(15, 43)">
      <rect width="20" height="14" rx="2" fill="url(#hex-mq)" opacity="0.3" />
      <path d="M 2 2 L 10 8 L 18 2" stroke="url(#hex-mq)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
    </g>

    {/* Envelope 2 */}
    <g transform="translate(40, 43)">
      <rect width="20" height="14" rx="2" fill="url(#hex-mq)" opacity="0.6" />
      <path d="M 2 2 L 10 8 L 18 2" stroke="url(#hex-mq)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
    </g>

    {/* Envelope 3 */}
    <g transform="translate(65, 43)">
      <rect width="20" height="14" rx="2" fill="url(#hex-mq)" opacity="1" />
      <path d="M 2 2 L 10 8 L 18 2" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>

    {/* Arrow pushing out */}
    <path d="M 92 50 L 102 50 L 97 45 M 102 50 L 97 55" stroke="url(#hex-mq)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </HexagonBase>
);

export const HexApiGatewayIcon = ({ className }: IconProps) => (
  <HexagonBase className={className} gradientId="hex-api" color1="#3b82f6" color2="#2563eb">
    {/* Main Router Box */}
    <rect x="35" y="20" width="30" height="60" rx="4" fill="url(#hex-api)" opacity="0.3" />

    {/* Hub symbol inside box */}
    <circle cx="50" cy="50" r="6" fill="url(#hex-api)" opacity="1" />
    <path d="M 50 35 L 50 65" stroke="url(#hex-api)" strokeWidth="4" strokeLinecap="round" />

    {/* Line In (Client) */}
    <path d="M 10 50 L 35 50" stroke="url(#hex-api)" strokeWidth="6" strokeLinecap="round" />

    {/* Lines Out (Microservices) */}
    <path d="M 65 30 L 90 30" stroke="url(#hex-api)" strokeWidth="6" strokeLinecap="round" />
    <path d="M 65 50 L 90 50" stroke="url(#hex-api)" strokeWidth="6" strokeLinecap="round" />
    <path d="M 65 70 L 90 70" stroke="url(#hex-api)" strokeWidth="6" strokeLinecap="round" />
  </HexagonBase>
);

export const HexServerIcon = ({ className }: IconProps) => (
  <HexagonBase className={className} gradientId="hex-server" color1="#06b6d4" color2="#0891b2">
    <rect x="15" y="15" width="70" height="20" rx="4" fill="url(#hex-server)" opacity="1" />
    <rect x="15" y="40" width="70" height="20" rx="4" fill="url(#hex-server)" opacity="0.6" />
    <rect x="15" y="65" width="70" height="20" rx="4" fill="url(#hex-server)" opacity="0.3" />
    <circle cx="25" cy="25" r="4" fill="white" />
    <circle cx="25" cy="50" r="4" fill="white" />
    <circle cx="25" cy="75" r="4" fill="white" />
  </HexagonBase>
);

export const HexCdnIcon = ({ className }: IconProps) => (
  <HexagonBase className={className} gradientId="hex-cdn" color1="#eab308" color2="#ca8a04">
    <circle cx="50" cy="50" r="35" fill="none" stroke="url(#hex-cdn)" strokeWidth="6" opacity="0.4" />
    <ellipse cx="50" cy="50" rx="15" ry="35" fill="none" stroke="url(#hex-cdn)" strokeWidth="4" opacity="0.4" />
    <path d="M 15 50 L 85 50" stroke="url(#hex-cdn)" strokeWidth="4" opacity="0.4" />
    <circle cx="15" cy="50" r="8" fill="url(#hex-cdn)" />
    <circle cx="85" cy="50" r="8" fill="url(#hex-cdn)" />
    <circle cx="50" cy="15" r="8" fill="url(#hex-cdn)" />
    <circle cx="50" cy="85" r="8" fill="url(#hex-cdn)" />
  </HexagonBase>
);

export const HexStorageIcon = ({ className }: IconProps) => (
  <HexagonBase className={className} gradientId="hex-storage" color1="#ec4899" color2="#be185d">
    {/* Bucket Body */}
    <path d="M 25 35 L 30 75 C 30 83, 70 83, 70 75 L 75 35 Z" fill="url(#hex-storage)" opacity="0.3" />

    {/* Bucket Top Opening */}
    <ellipse cx="50" cy="35" rx="25" ry="8" fill="url(#hex-storage)" opacity="1" />
    <ellipse cx="50" cy="35" rx="18" ry="4" fill="#ffffff" opacity="0.9" />
  <text 
      x="50" 
      y="58" 
      fill="#ec4899" 
      fontSize="16" 
      fontWeight="bold" 
      fontFamily="system-ui, -apple-system, sans-serif"
      textAnchor="middle" 
      dominantBaseline="middle"
      letterSpacing="0"
      opacity="0.95"
    >
      S3
    </text>
  </HexagonBase>
);
