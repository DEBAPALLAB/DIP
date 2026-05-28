import Link from "next/link";

export function Footer() {
  return (
    <footer className="marketing-footer">
      <div className="footer-grid">
        {/* Brand col */}
        <div className="footer-brand">
          <Link href="/" className="footer-logo-link">
            STRAWBERRY <span style={{ color: "var(--orange)" }}>.</span>
          </Link>
          <p className="footer-tagline">
            Precision agent-level simulation for strategic decision-making.
            Built at the intersection of behavioral science and AI.
          </p>
          <div className="footer-status-row">
            <span className="footer-status-dot" />
            ALL SYSTEMS OPERATIONAL
          </div>
        </div>

        {/* Product col */}
        <div>
          <div className="footer-col-title">PRODUCT</div>
          <div className="footer-links-col">
            <Link href="/features">Features</Link>
            <Link href="/technology">Technology</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/setup">Dashboard</Link>
          </div>
        </div>

        {/* Company col */}
        <div>
          <div className="footer-col-title">COMPANY</div>
          <div className="footer-links-col">
            <Link href="/about">About Lucide Tech</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>

        {/* Access col */}
        <div>
          <div className="footer-col-title">ACCESS</div>
          <div className="footer-links-col">
            <Link href="/login">Sign In</Link>
            <Link href="/register">Create Account</Link>
            <Link href="/technology">Documentation</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-bottom-text">
          © 2024 LUCIDE TECH · STRAWBERRY PLATFORM · ALL RIGHTS RESERVED
        </span>
        <span className="footer-bottom-text">
          PRIVACY · TERMS · SECURITY
        </span>
      </div>
    </footer>
  );
}
