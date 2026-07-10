import type { Metadata } from "next";
import QuibiCaseStudyClient from "./QuibiCaseStudyClient";

export const metadata: Metadata = {
  title: "Quibi Case Study: Retrospective Validation | notaprompt.in",
  description:
    "We ran Quibi's real $1.75B launch parameters through the behavioral simulation engine — no hindsight, no outcome data. Here's what the utility mechanics predicted, and how it lines up against the 500K subscribers Quibi actually got.",
  openGraph: {
    title: "We Ran Quibi's $1.75B Launch Through Our Simulation. It Never Had A Chance.",
    description:
      "A retrospective validation of the notaprompt.in behavioral simulation engine against Quibi's real 2020 launch — mechanism by mechanism.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "We Ran Quibi's $1.75B Launch Through Our Simulation. It Never Had A Chance.",
    description:
      "A retrospective validation of the notaprompt.in behavioral simulation engine against Quibi's real 2020 launch.",
  },
};

export default function QuibiCaseStudyPage() {
  return <QuibiCaseStudyClient />;
}
