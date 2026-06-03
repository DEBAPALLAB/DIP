import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { LenisSmoothScroll } from "@/components/marketing/LenisSmoothScroll";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative", backgroundColor: "var(--bg)" }} className="marketing-theme">
      <LenisSmoothScroll />
      
      {/* ── HIGH-FIDELITY MARKETING HEADER GRADIENT & VERTICAL CURTAIN SHAFTS ── */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "850px",
          background: `
            radial-gradient(550px circle at 0% 0%, rgba(0, 82, 255, 0.42) 0%, transparent 100%),
            radial-gradient(550px circle at 100% 0%, rgba(0, 82, 255, 0.42) 0%, transparent 100%),
            radial-gradient(500px 280px ellipse at 50% 0%, rgba(0, 82, 255, 0.2) 0%, transparent 100%)
          `,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden"
        }}
      >
        {/* Soft volumetric blurred curtain columns */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "450px", display: "flex", justifyContent: "space-between", padding: "0 8vw", opacity: 0.12, overflow: "hidden" }}>
          <div style={{ width: "65px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.5) 0%, transparent 100%)", filter: "blur(12px)" }} />
          <div style={{ width: "110px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.4) 0%, transparent 100%)", filter: "blur(20px)" }} />
          <div style={{ width: "85px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.45) 0%, transparent 100%)", filter: "blur(16px)" }} />
          <div style={{ width: "135px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.35) 0%, transparent 100%)", filter: "blur(24px)" }} />
          <div style={{ width: "75px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.5) 0%, transparent 100%)", filter: "blur(14px)" }} />
          <div style={{ width: "100px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.4) 0%, transparent 100%)", filter: "blur(18px)" }} />
        </div>
      </div>

      <div className="noise-overlay" />
      <Navbar />
      <main
        id="app-viewport"
        style={{
          flex: 1,
          position: "relative",
          width: "100%",
          paddingTop: 0,
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
