import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ padding: "0 4vw 40px 40px", background: "#050507" }}>
      {/* Curved Capsule Container */}
      <div
        style={{
          background: "#0d0c0b",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "40px 40px 0 0",
          padding: "80px 6vw 40px 6vw",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Footer Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.6fr 0.6fr 0.6fr", gap: "40px", marginBottom: "80px", position: "relative", zIndex: 10 }}>
          
          {/* Newsletter Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--accent)", fontSize: "20px" }}>◉</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "15px", fontWeight: 800, color: "var(--bright)", letterSpacing: "0.15em" }}>NOTAPROMPT</span>
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.02em" }}>Stay updated</h3>
            
            {/* Capsule Input Field */}
            <div style={{ display: "flex", width: "100%", maxWidth: "340px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "999px", padding: "4px 4px 4px 20px", alignItems: "center", justifyContent: "space-between" }}>
              <input
                type="email"
                placeholder="Enter email"
                style={{ background: "transparent", border: "none", outline: "none", color: "var(--bright)", fontFamily: "var(--sans)", fontSize: "13px", width: "70%" }}
              />
              <button style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(200, 241, 53, 0.1)", border: "1px solid rgba(200, 241, 53, 0.3)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", cursor: "pointer" }}>
                ↗
              </button>
            </div>

            {/* Social Icon Strip */}
            <div style={{ display: "flex", gap: "16px", opacity: 0.5, marginTop: "12px" }}>
              <span style={{ fontSize: "13px", fontFamily: "var(--mono)", cursor: "pointer" }}>TWITTER</span>
              <span style={{ fontSize: "13px", fontFamily: "var(--mono)", cursor: "pointer" }}>LINKEDIN</span>
              <span style={{ fontSize: "13px", fontFamily: "var(--mono)", cursor: "pointer" }}>GITHUB</span>
              <span style={{ fontSize: "13px", fontFamily: "var(--mono)", cursor: "pointer" }}>DISCORD</span>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.1em", display: "block", marginBottom: "20px" }}>FEATURES</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--sans)", fontSize: "13px" }}>
              <Link href="/features" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Cascade Simulators</Link>
              <Link href="/technology" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Small-World Graphs</Link>
              <Link href="/pricing" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Strategic License</Link>
              <Link href="/about" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>System Security</Link>
            </div>
          </div>

          {/* Company Column */}
          <div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.1em", display: "block", marginBottom: "20px" }}>COMPANY</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--sans)", fontSize: "13px" }}>
              <Link href="/about" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>About Lucide Tech</Link>
              <Link href="/contact" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Boutique Studio</Link>
              <Link href="/about" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Strategic Lab</Link>
              <Link href="/contact" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Contact</Link>
            </div>
          </div>

          {/* Resources Column */}
          <div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.1em", display: "block", marginBottom: "20px" }}>RESOURCES</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--sans)", fontSize: "13px" }}>
              <Link href="/technology" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Documentation</Link>
              <Link href="/about" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Security Portal</Link>
              <Link href="/technology" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Sociometric Guide</Link>
              <Link href="/contact" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>System Health</Link>
            </div>
          </div>

        </div>

        {/* Copyright Line */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", position: "relative", zIndex: 10 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)" }}>© 2026 NOTAPROMPT · BUILT BY LUCIDE TECH</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)" }}>PRIVACY · TERMS · SECURITY</span>
        </div>

        {/* Huge Outlined Watermark Text */}
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "12vw",
            fontFamily: "var(--sans)",
            fontWeight: 900,
            color: "transparent",
            WebkitTextStroke: "1px rgba(255, 255, 255, 0.015)",
            letterSpacing: "0.06em",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
            whiteSpace: "nowrap"
          }}
        >
          NOTAPROMPT
        </div>

      </div>
    </footer>
  );
}
