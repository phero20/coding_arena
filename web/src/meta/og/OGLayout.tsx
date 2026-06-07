import fs from "fs";
import path from "path";
import React from "react";

export function OGLayout({ children }: { children: React.ReactNode }) {
  // We read the logo once and convert it so it can be passed to Satori
  const logoData = fs.readFileSync(path.join(process.cwd(), "public", "logos", "logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

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
