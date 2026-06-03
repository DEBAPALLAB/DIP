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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/technology", label: "Technology" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    ...(isAuthenticated ? [{ href: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .marketing-theme .floating-navbar {
          background: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
        }
        .marketing-theme .nav-wrapper-floating.scrolled .floating-navbar {
          background: rgba(255, 255, 255, 0.45) !important;
          border-color: rgba(0, 82, 255, 0.08) !important;
          box-shadow: 0 20px 40px rgba(0, 82, 255, 0.03) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
        }
        
        /* Ensure navigation links look premium under marketing theme */
        .marketing-theme .floating-logo {
          color: var(--bright) !important;
        }
        .marketing-theme .logo-text-bold {
          color: var(--bright) !important;
        }
        .marketing-theme .floating-nav-links-pill {
          background: rgba(0, 0, 0, 0.03) !important;
          border: 1px solid rgba(0, 0, 0, 0.04) !important;
        }
        .marketing-theme .floating-nav-link {
          color: var(--muted) !important;
        }
        .marketing-theme .floating-nav-link:hover {
          color: var(--bright) !important;
          background: rgba(0, 0, 0, 0.03) !important;
        }
        .marketing-theme .floating-nav-link.active {
          color: var(--bright) !important;
          background: rgba(0, 0, 0, 0.06) !important;
          box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.05) !important;
        }
        .marketing-theme .btn-signout-capsule, 
        .marketing-theme .btn-login-capsule {
          color: var(--text) !important;
        }
        .marketing-theme .user-email-badge {
          color: var(--text) !important;
        }
        .marketing-theme .btn-signout-capsule:hover, 
        .marketing-theme .btn-login-capsule:hover {
          color: var(--bright) !important;
          background: rgba(0, 0, 0, 0.03) !important;
        }
        .marketing-theme .floating-hamburger .burger-line {
          background-color: var(--bright) !important;
        }
        .marketing-theme .btn-getstarted-capsule {
          border: 1px solid rgba(0, 82, 255, 0.15) !important;
        }
      `}} />
      <div className={`nav-wrapper-floating ${scrolled ? "scrolled" : ""}`}>
        <nav className="floating-navbar">
          {/* Logo on the left */}
          <Link href="/" className="floating-logo">
            <span className="logo-icon-blue">◉</span>
            <span className="logo-text-bold">NOTAPROMPT</span>
          </Link>

          {/* Central links pill */}
          <div className="floating-nav-links-pill">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`floating-nav-link ${pathname === link.href ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions on the right */}
          <div className="floating-actions">
            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span className="user-email-badge">{user?.email}</span>
                <button onClick={logout} className="btn-signout-capsule">
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-login-capsule">
                  Log In
                </Link>
                <Link href="/register" className="btn-getstarted-capsule">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Hamburger for Mobile */}
          <button
            className={`floating-hamburger ${mobileOpen ? "open" : ""}`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle Navigation"
          >
            <span className="burger-line" />
            <span className="burger-line" />
            <span className="burger-line" />
          </button>
        </nav>
      </div>

      {/* Mobile Drawer */}
      <div className={`floating-mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="drawer-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
          <div className="drawer-divider" />
          {isAuthenticated ? (
            <button className="drawer-signout-btn" onClick={() => { setMobileOpen(false); logout(); }}>
              Sign Out
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", padding: "0 24px" }}>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="drawer-login-btn">
                Log In
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="drawer-signup-btn">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
