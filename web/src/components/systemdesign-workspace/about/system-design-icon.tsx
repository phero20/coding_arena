import React from "react";

export const SystemDesignIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="-40 -40 260 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="sd-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="sd-purple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#5b21b6" />
      </linearGradient>
      <linearGradient id="sd-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="sd-orange" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>
    </defs>

    {/* Floating Elements (System Design Icons) */}
    <g className="floating-elements" opacity="0.6" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Top Left: Cloud */}
      <g transform="translate(35, -25) scale(0.4)" stroke="#3b82f6">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
      </g>
      
      {/* Top Right: CPU/Chip */}
      <g transform="translate(145, -25) scale(0.4)" stroke="#facc15">
        <rect width="16" height="16" x="4" y="4" rx="2"/>
        <rect width="6" height="6" x="9" y="9" rx="1"/>
        <path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>
      </g>

      {/* Right: Shield */}
      <g transform="translate(200, 60) scale(0.4)" stroke="#8b5cf6">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-3 5.99-5.11a2 2 0 0 1 2.02 0C15 2 17 4 19 5a1 1 0 0 1 1 1z"/>
      </g>

      {/* Bottom Right: Server Rack */}
      <g transform="translate(145, 145) scale(0.4)" stroke="#f97316">
        <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
        <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
        <line x1="6" x2="6.01" y1="6" y2="6"/>
        <line x1="6" x2="6.01" y1="18" y2="18"/>
      </g>

      {/* Bottom Left: Database */}
      <g transform="translate(35, 145) scale(0.4)" stroke="#10b981">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
        <path d="M3 12A9 3 0 0 0 21 12"/>
      </g>

      {/* Left: Globe */}
      <g transform="translate(-20, 60) scale(0.4)" stroke="#94a3b8">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <path d="M2 12h20"/>
      </g>
    </g>
    {/* Network Lines */}
    <g strokeWidth="2" strokeDasharray="4 4" opacity="0.4">
      {/* Client to LB */}
      <path d="M 30 60 L 56 60" stroke="#3b82f6" />
      
      {/* LB to Servers */}
      <path d="M 86 60 L 116 30" stroke="#8b5cf6" />
      <path d="M 86 60 L 116 60" stroke="#8b5cf6" />
      <path d="M 86 60 L 116 90" stroke="#8b5cf6" />
      
      {/* Servers to DB */}
      <path d="M 140 30 L 156 55" stroke="#10b981" />
      <path d="M 140 60 L 156 60" stroke="#10b981" />
      <path d="M 140 90 L 156 65" stroke="#10b981" />
    </g>

    {/* Client (Laptop) */}
    <g transform="translate(4, 52)">
      <rect x="4" y="0" width="22" height="14" rx="2" fill="url(#sd-blue)" />
      <rect x="6" y="2" width="18" height="10" rx="1" fill="#0f172a" />
      <path d="M 0 16 L 30 16" stroke="url(#sd-blue)" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* Load Balancer */}
    <g transform="translate(56, 45)">
      <rect x="0" y="0" width="30" height="30" rx="6" fill="url(#sd-purple)" />
      {/* LB symbol (Arrows splitting) */}
      <path d="M 8 15 L 14 15 M 14 15 L 22 9 M 14 15 L 22 21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 19 9 L 22 9 L 22 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 19 21 L 22 21 L 22 18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Servers (Microservices) */}
    {[20, 50, 80].map((y, i) => (
      <g key={i} transform={`translate(116, ${y})`}>
        <rect x="0" y="0" width="24" height="20" rx="4" fill="url(#sd-emerald)" />
        {/* Server slots */}
        <rect x="4" y="4" width="16" height="2" rx="1" fill="#ffffff" opacity="0.6" />
        <rect x="4" y="9" width="16" height="2" rx="1" fill="#ffffff" opacity="0.6" />
        {/* Lights */}
        <circle cx="6" cy="16" r="1.5" fill="#34d399" />
        <circle cx="10" cy="16" r="1.5" fill="#fcd34d" />
      </g>
    ))}

    {/* Database */}
    <g transform="translate(156, 48)">
      <path d="M 0 5 C 0 2, 10 0, 10 0 C 10 0, 20 2, 20 5 L 20 25 C 20 28, 10 30, 10 30 C 10 30, 0 28, 0 25 Z" fill="url(#sd-orange)" />
      <ellipse cx="10" cy="5" rx="10" ry="3" fill="#fdba74" opacity="0.8" />
      <path d="M 0 12 C 0 15, 10 17, 10 17 C 10 17, 20 15, 20 12" stroke="#ea580c" strokeWidth="1" fill="none" />
      <path d="M 0 19 C 0 22, 10 24, 10 24 C 10 24, 20 22, 20 19" stroke="#ea580c" strokeWidth="1" fill="none" />
    </g>
  </svg>
);
