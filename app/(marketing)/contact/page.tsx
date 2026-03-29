"use client";

export default function ContactPage() {
  return (
    <div className="landing-v2-container">
      <section className="hero-v2" style={{ paddingTop: "80px" }}>
        <span className="section-label">[INQUIRY_INPUT]</span>
        <h1 style={{ fontSize: "72px", marginBottom: "40px" }}>CONTACT THE <br/>AGENCY.</h1>
        
        <div className="home-login-section" style={{ marginTop: "40px" }}>
          <div className="login-form-hook">
            <h2>START A PARTNERSHIP.</h2>
            <p>
              Looking for custom simulation models, deep-dive market analysis, or 
              bespoke behavioral vector fitting? Our senior stratigists are ready 
              to discuss your specific project needs.
            </p>
            <div style={{ marginTop: "40px" }}>
              <div style={{ color: "var(--orange)", fontFamily: "var(--mono)", fontSize: "12px", marginBottom: "8px" }}>// EMAIL</div>
              <div style={{ color: "var(--bright)", fontSize: "18px" }}>agency@strawberry.ai</div>
            </div>
          </div>

          <div className="login-mini-card glass">
            <input type="text" placeholder="FULL_NAME" className="input-v2" />
            <input type="email" placeholder="EMAIL_ADDRESS" className="input-v2" />
            <select className="input-v2" style={{ background: "var(--bg-darker)" }}>
              <option>SELECT_INQUIRY_TYPE</option>
              <option>ENTERPRISE_SALES</option>
              <option>CUSTOM_SIMULATION</option>
              <option>TECHNICAL_SUPPORT</option>
              <option>PARTNERSHIP</option>
            </select>
            <textarea placeholder="MESSAGE_DETAILS" className="input-v2" style={{ height: "120px", resize: "none" }}></textarea>
            <button className="btn-primary" style={{ width: "100%", height: "48px", marginTop: "16px" }}>
              SUBMIT_ENQUIRY
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
