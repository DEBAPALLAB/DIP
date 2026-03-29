"use client";

import Link from "next/link";
import { InlineLogin } from "@/components/marketing/InlineLogin";
import Squares from "@/components/marketing/InteractiveBackground";
import { useEffect } from "react";
import { ScrambleText } from "@/components/marketing/ScrambleText";

export default function LandingPage() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="landing-v2-container">
      <Squares 
        direction="diagonal"
        speed={0.5}
        squareSize={40}
        borderColor="rgba(255, 107, 53, 0.1)"
        hoverFillColor="rgba(255, 107, 53, 0.15)"
      />
      {/* ── Ticker ── */}
      <div className="ticker-wrap">
        <div className="ticker">
          <span className="ticker-item">ID: 402 | <ScrambleText text="RISK_AV_0.82" duration={400} revealSpeed={20} className="flicker-v2" /> | TRUST: 0.12 | BUDGET: 0.45</span>
          <span className="ticker-item">ID: 119 | <ScrambleText text="RISK_AV_0.22" duration={400} revealSpeed={20} /> | TRUST: 0.78 | BUDGET: 0.12</span>
          <span className="ticker-item">ID: 884 | <ScrambleText text="RISK_AV_0.55" duration={400} revealSpeed={20} /> | TRUST: 0.45 | BUDGET: 0.88</span>
          <span className="ticker-item">ID: 213 | <ScrambleText text="RISK_AV_0.12" duration={400} revealSpeed={20} /> | TRUST: 0.90 | BUDGET: 0.32</span>
          <span className="ticker-item">ID: 677 | <ScrambleText text="RISK_AV_0.95" duration={400} revealSpeed={20} /> | TRUST: 0.05 | BUDGET: 0.75</span>
          {/* Duplicate for seamless loop */}
          <span className="ticker-item">ID: 402 | <ScrambleText text="RISK_AV_0.82" duration={400} revealSpeed={20} /> | TRUST: 0.12 | BUDGET: 0.45</span>
          <span className="ticker-item">ID: 119 | <ScrambleText text="RISK_AV_0.22" duration={400} revealSpeed={20} /> | TRUST: 0.78 | BUDGET: 0.12</span>
          <span className="ticker-item">ID: 884 | <ScrambleText text="RISK_AV_0.55" duration={400} revealSpeed={20} /> | TRUST: 0.45 | BUDGET: 0.88</span>
          <span className="ticker-item">ID: 213 | <ScrambleText text="RISK_AV_0.12" duration={400} revealSpeed={20} /> | TRUST: 0.90 | BUDGET: 0.32</span>
          <span className="ticker-item">ID: 677 | <ScrambleText text="RISK_AV_0.95" duration={400} revealSpeed={20} /> | TRUST: 0.05 | BUDGET: 0.75</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="hero-v2">
        <span className="flicker-v2" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--orange)', letterSpacing: '0.2em', display: 'block', marginBottom: '24px' }}>
          [PLATFORM_VERSION_4.2] · <ScrambleText text="QUANTUM_BEHAVIOR_MODEL" duration={800} revealSpeed={30} />
        </span>
        <h1 style={{ fontWeight: 800 }}>
          <ScrambleText text="DECODE THE ARCHITECTURE" duration={500} revealSpeed={50} /> <br/>
          <ScrambleText text="OF INFLUENCE." duration={800} revealSpeed={40} />
        </h1>
        <p>
          Precision agent-level simulation for strategic decision-making.
          Map adoption cascades, identify structural bottlenecks, and stress-test your strategy against verified sociometric data.
        </p>
        <div className="hero-actions">
          <Link href="/setup" className="btn-v2-primary">
            LAUNCH_SIMULATION
          </Link>
          <Link href="/technology" className="btn-v2-ghost">
            EXPLORE_THE_TRINITY_ENGINE
          </Link>
        </div>

        {/* ── Demo (Insights in Action) ── */}
        <div className="souvenirs-section">
          <span className="section-label">[PRODUCT_DEMONSTRATION]</span>
          <h2 className="section-title">INSIGHTS IN ACTION.</h2>
          <div className="demo-grid">
            <div className="demo-card glass">
              <div className="demo-img-placeholder">
                <img src="/dashboard_demo.png" alt="Dashboard Demo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="demo-info">
                <h3>GRAPH_DYNAMICS</h3>
                <p>Observe real-time cascades across social graphs. Identify structural bottlenecks where influence stalls or accelerates.</p>
              </div>
            </div>
            <div className="demo-card glass">
              <div className="demo-img-placeholder">
                <img src="/agent_demo.png" alt="Agent Demo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="demo-info">
                <h3>AGENT_PSYCHOGRAPHICS</h3>
                <p>High-fidelity persona modeling. Analyze individual reasoning through deep sociometric trait mapping.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sign In Section ── */}
        <div className="home-login-section">
          <div className="login-form-hook">
            <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--orange)' }}>[AUTHENTICATION_GATE]</span>
            <h2>ACCESS THE <br/>COMMAND CENTER.</h2>
            <p>
              Log in to your private workspace to manage research experiments, 
              analyze past results, and export comprehensive behavioral reports.
            </p>
            <div style={{ marginTop: "24px" }}>
               <Link href="/security" style={{ color: 'var(--bright)', fontSize: '12px', textDecoration: 'none' }}>LEARN_MORE_ABOUT_ENCRYPTION →</Link>
            </div>
          </div>

          <InlineLogin />
        </div>
      </section>



    </div>
  );
}


