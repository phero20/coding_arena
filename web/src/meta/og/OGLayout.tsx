import React from "react";

export function OGLayout({ children }: { children: React.ReactNode }) {
  // We use an absolute URL so Vercel's Satori can fetch it automatically without file system errors
  const logoSrc = "https://slavecode.codes/logos/logo.png";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "40px",
        textAlign: "center",
        borderTop: "8px solid #ffffff",
      }}
    >
      {/* Universal Brand Header */}
      <div
        style={{
          fontSize: 90,
          fontWeight: 900,
          color: "#ffffff",
          letterSpacing: "-0.05em",
          marginBottom: 40,
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src={logoSrc}
          width={160}
          height={160}
          style={{ marginRight: "0px" }}
          alt="Logo"
        />
        SlaveCode
      </div>

      {/* Dynamic Page Specific Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
