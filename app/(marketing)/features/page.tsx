"use client";

export default function FeaturesPage() {
  const features = [
    {
      title: "Behavioral Vector Analysis",
      desc: "Sampling from 1,499 NORC respondents to create high-fidelity agent personalities.",
      tag: "CORE_TECH"
    },
    {
      title: "Social Cascade Modeling",
      desc: "Simulate how information and influence travel through Watts-Strogatz small-world networks.",
      tag: "NETWORK_DYNAMICS"
    },
    {
      title: "Parallel Multi-Verse Testing",
      desc: "Run thousands of simulations in parallel to find the optimal strategy for market entry.",
      tag: "STRATEGY"
    },
    {
      title: "LLM-Powered Agent Logic",
      desc: "Every agent uses advanced reasoning to decide whether to adopt, ignore, or oppose.",
      tag: "INTELLIGENCE"
    }
  ];

  return (
    <div className="landing-v2-container">
      <section className="hero-v2" style={{ paddingTop: "80px" }}>
        <span className="section-label">[PRODUCT_CAPABILITIES]</span>
        <h1 style={{ fontSize: "72px", marginBottom: "40px" }}>ENGINEERED FOR <br/>PRECISION.</h1>
        <p style={{ maxWidth: "600px", margin: "0 auto 80px 0" }}>
          Strawberry provides a level of granularity in social simulation never before possible. 
          By combining historical behavioral data with modern LLM reasoning, we map the latent 
          landscape of public opinion.
        </p>

        <div className="demo-grid">
          {features.map((f, i) => (
            <div key={i} className="demo-card glass">
              <div className="demo-info">
                <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--orange)" }}>// {f.tag}</span>
                <h3 style={{ marginTop: "12px" }}>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
