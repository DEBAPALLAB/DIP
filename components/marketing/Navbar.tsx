"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const isLanding = pathname === "/";

  return (
    <nav className="marketing-nav">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          STRAWBERRY <span className="logo-dot">.</span>
        </Link>
        
        <div className="nav-links">
          <Link href="/features" className={pathname === "/features" ? "active" : ""}>
            FEATURES
          </Link>
          <Link href="/technology" className={pathname === "/technology" ? "active" : ""}>
            TECHNOLOGY
          </Link>
          <Link href="/pricing" className={pathname === "/pricing" ? "active" : ""}>
            PRICING
          </Link>
          {isAuthenticated && (
            <Link href="/setup" className={pathname === "/setup" ? "active" : ""}>
              DASHBOARD
            </Link>
          )}
          <Link href="/about" className={pathname === "/about" ? "active" : ""}>
            ABOUT
          </Link>
          <Link href="/contact" className={pathname === "/contact" ? "active" : ""}>
            CONTACT
          </Link>
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="nav-user-id" style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                ID: {user?.id}
              </span>
              <button onClick={logout} className="btn-ghost-nav" style={{ cursor: "pointer", background: "none", border: "none" }}>
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

      </div>
    </nav>
  );
}

