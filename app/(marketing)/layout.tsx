import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main
        id="app-viewport"
        style={{
          flex: 1,
          position: "relative",
          width: "100%",
          paddingTop: "64px",
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
