"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinks = [
    { href: "/features", label: "FEATURES" },
    { href: "/technology", label: "TECHNOLOGY" },
    { href: "/pricing", label: "PRICING" },
    { href: "/about", label: "ABOUT" },
    ...(isAuthenticated ? [{ href: "/dashboard", label: "DASHBOARD" }] : []),
  ];

  return (
    <>
      <nav className={`marketing-nav${scrolled ? " nav-scrolled" : ""}`}>
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            NOTAPROMPT <span className="logo-dot">.in</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    maxWidth: "140px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="btn-ghost-nav"
                  style={{ cursor: "pointer", background: "none", border: "none" }}
                >
                  SIGN_OUT
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost-nav">
                  SIGN_IN
                </Link>
                <Link href="/register" className="btn-primary-nav">
                  GET_STARTED
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger${mobileOpen ? " ham-open" : ""}`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer${mobileOpen ? " mob-open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
          >
            {link.label}
          </Link>
        ))}
        {isAuthenticated ? (
          <button className="mob-signout-btn" onClick={logout}>
            SIGN_OUT
          </button>
        ) : (
          <>
            <Link href="/login">SIGN_IN</Link>
            <Link href="/register" className="mob-accent">
              GET_STARTED →
            </Link>
          </>
        )}
      </div>
    </>
  );
}
