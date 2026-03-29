import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "./providers";

export const metadata: Metadata = {
  title: "Decision Intelligence Platform",
  description:
    "Agent-based simulation of population decision-making using GSS 2024 behavioral trait vectors and LLM-powered reasoning with Watts-Strogatz social network cascade.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning style={{ height: "100%", margin: 0, padding: 0 }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body style={{ 
        background: "#050507", 
        color: "var(--text)", 
        minHeight: "100vh", 
        width: "100%",
        margin: 0,
        padding: 0
      }}>
        <ClientProviders>
            {children}
        </ClientProviders>
      </body>
    </html>
  );
}

