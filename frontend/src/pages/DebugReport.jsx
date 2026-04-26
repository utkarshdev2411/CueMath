import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DebugReport() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/report", {
      state: {
        candidateName: "Utkarsh Sharma",
        elapsedSeconds: 310,
        transcript: [{ role: "assistant", content: "Hi" }],
        report: {
          overall: "review",
          summary: "This is a test summary.",
          weighted_score: 3.2,
          dimensions: {
            clarity: { score: 1.5, evidence: "I will beat the crap out of the... wait this is long to test if it wraps properly and doesn't get cut off in the UI or PDF generation." },
            simplification: { score: 3.5, evidence: "This is amber." },
            warmth: { score: 4.8, evidence: "This is green." },
            patience: { score: 2.0, evidence: "This is red." },
            fluency: { score: 5.0, evidence: "Also green." },
          },
          red_flags: ["Flag 1"]
        }
      }
    });
  }, [navigate]);
  return null;
}
