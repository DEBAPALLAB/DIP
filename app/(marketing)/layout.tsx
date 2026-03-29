import { Navbar } from "@/components/marketing/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>
      <main id="app-viewport" style={{ 
        flex: 1, 
        position: "relative", 
        overflowY: "auto",
        width: "100%",
        paddingTop: "64px"
      }}>
        {children}
      </main>
      <footer className="global-footer" style={{ flexShrink: 0 }}>
        [SYS_META] · DESIGNED AND DEVELOPED BY <span className="footer-highlight">LUCIDE TECH</span> · © 2024
      </footer>
    </div>
  );
}
