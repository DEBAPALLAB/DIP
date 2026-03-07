import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
