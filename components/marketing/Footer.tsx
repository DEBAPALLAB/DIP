import Link from "next/link";

export function Footer() {
  return (
    <footer className="marketing-footer" style={{ padding: "0 4vw 40px 40px", background: "transparent" }}>
      {/* Curved Capsule Container (Premium Light-glass panel) */}
      <div
        className="marketing-footer-shell"
        style={{
          background: "var(--panel)",
          backdropFilter: "blur(24px)",
          border: "1px solid var(--border)",
          borderRadius: "40px 40px 0 0",
          padding: "80px 6vw 40px 6vw",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Footer Grid */}
        <div className="marketing-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.6fr 0.6fr 0.6fr", gap: "40px", marginBottom: "80px", position: "relative", zIndex: 10 }}>
          
          {/* Newsletter Column */}
          <div className="marketing-footer-brand" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--accent)", fontSize: "20px" }}>◉</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "15px", fontWeight: 800, color: "var(--bright)", letterSpacing: "0.15em" }}>NOTAPROMPT</span>
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.02em" }}>Stay updated</h3>
            
            {/* Capsule Input Field */}
            <div className="marketing-footer-input" style={{ display: "flex", width: "100%", maxWidth: "340px", background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)", borderRadius: "999px", padding: "4px 4px 4px 20px", alignItems: "center", justifyContent: "space-between" }}>
              <input
                type="email"
                placeholder="Enter email"
                style={{ background: "transparent", border: "none", outline: "none", color: "var(--bright)", fontFamily: "var(--sans)", fontSize: "13px", width: "70%" }}
              />
              <button style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0, 82, 255, 0.05)", border: "1px solid rgba(0, 82, 255, 0.15)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", cursor: "pointer" }}>
                ↗
              </button>
            </div>

            {/* Social Icon Strip */}
            <div className="marketing-footer-social" style={{ display: "flex", gap: "16px", opacity: 0.6, marginTop: "12px" }}>
              <span style={{ fontSize: "13px", fontFamily: "var(--mono)", cursor: "pointer", color: "var(--text)" }}>TWITTER</span>
              <span style={{ fontSize: "13px", fontFamily: "var(--mono)", cursor: "pointer", color: "var(--text)" }}>LINKEDIN</span>
              <span style={{ fontSize: "13px", fontFamily: "var(--mono)", cursor: "pointer", color: "var(--text)" }}>GITHUB</span>
              <span style={{ fontSize: "13px", fontFamily: "var(--mono)", cursor: "pointer", color: "var(--text)" }}>DISCORD</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="marketing-footer-col">
            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.1em", display: "block", marginBottom: "20px" }}>FEATURES</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--sans)", fontSize: "13px" }}>
              <Link href="/features" style={{ color: "var(--text)", textDecoration: "none" }}>Cascade Simulators</Link>
              <Link href="/technology" style={{ color: "var(--text)", textDecoration: "none" }}>Small-World Graphs</Link>
              <Link href="/pricing" style={{ color: "var(--text)", textDecoration: "none" }}>Strategic License</Link>
              <Link href="/about" style={{ color: "var(--text)", textDecoration: "none" }}>System Security</Link>
            </div>
          </div>

          {/* Company Column */}
          <div className="marketing-footer-col">
            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.1em", display: "block", marginBottom: "20px" }}>COMPANY</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--sans)", fontSize: "13px" }}>
              <Link href="/about" style={{ color: "var(--text)", textDecoration: "none" }}>About Lucide Tech</Link>
              <Link href="/contact" style={{ color: "var(--text)", textDecoration: "none" }}>Boutique Studio</Link>
              <Link href="/about" style={{ color: "var(--text)", textDecoration: "none" }}>Strategic Lab</Link>
              <Link href="/contact" style={{ color: "var(--text)", textDecoration: "none" }}>Contact</Link>
            </div>
          </div>

          {/* Resources Column */}
          <div className="marketing-footer-col">
            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.1em", display: "block", marginBottom: "20px" }}>RESOURCES</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--sans)", fontSize: "13px" }}>
              <Link href="/technology" style={{ color: "var(--text)", textDecoration: "none" }}>Documentation</Link>
              <Link href="/about" style={{ color: "var(--text)", textDecoration: "none" }}>Security Portal</Link>
              <Link href="/technology" style={{ color: "var(--text)", textDecoration: "none" }}>Sociometric Guide</Link>
              <Link href="/contact" style={{ color: "var(--text)", textDecoration: "none" }}>System Health</Link>
            </div>
          </div>

        </div>

        {/* Copyright Line */}
        <div className="marketing-footer-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "24px", position: "relative", zIndex: 10 }}>
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
            WebkitTextStroke: "1px rgba(0, 82, 255, 0.02)",
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
