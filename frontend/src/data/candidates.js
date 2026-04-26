export const candidates = [
  {
    id: "c001",
    name: "Anjali Sharma",
    date: "2026-04-24",
    duration: "5m 12s",
    messages: 14,
    verdict: "pass",
    weighted_score: 4.3,
    summary:
      "Anjali demonstrated exceptional ability to simplify complex concepts with concrete examples. Her warmth was immediately evident and she showed strong empathy when describing how she handles struggling students.",
    dimensions: {
      clarity: {
        score: 4,
        evidence:
          "I'd break it into three steps — first show them a real object, then draw it, then write the number",
      },
      simplification: {
        score: 5,
        evidence:
          "Imagine you have a pizza and four friends — if you cut it into four equal pieces, each person gets one-fourth",
      },
      warmth: {
        score: 5,
        evidence:
          "I always tell them that feeling confused means your brain is working really hard, and that's actually a good sign",
      },
      patience: {
        score: 4,
        evidence:
          "First I'd ask them to tell me what they understand so far, because the gap is usually smaller than it seems",
      },
      fluency: {
        score: 3,
        evidence: "No notable errors — minor grammatical slips that didn't affect clarity",
      },
    },
    red_flags: [],
    recommendation:
      "Strongly recommend advancing to round 2. Natural teaching instinct and exceptional warmth. Ask about experience with younger students specifically.",
  },
  {
    id: "c002",
    name: "Rahul Mehta",
    date: "2026-04-23",
    duration: "4m 48s",
    messages: 12,
    verdict: "review",
    weighted_score: 3.1,
    summary:
      "Rahul showed good subject knowledge and reasonable clarity but his answers were often too abstract for a 9-year-old audience. Warmth was present but felt scripted rather than natural.",
    dimensions: {
      clarity: {
        score: 4,
        evidence:
          "So what I would do is explain the numerator and denominator separately first, then bring them together",
      },
      simplification: {
        score: 2,
        evidence:
          "A fraction is essentially a ratio between two integers where the denominator cannot be zero",
      },
      warmth: {
        score: 3,
        evidence:
          "I understand that students can sometimes feel overwhelmed by mathematical concepts",
      },
      patience: {
        score: 3,
        evidence: "I would try a different approach and maybe use a visual method instead",
      },
      fluency: {
        score: 4,
        evidence: "Articulate and grammatically strong throughout the conversation",
      },
    },
    red_flags: [
      "Explanation used jargon inappropriate for a 9-year-old",
      "Did not probe student understanding before re-explaining",
    ],
    recommendation:
      "Borderline candidate. Recommend a second human review. Strong fluency and clarity but simplification needs significant improvement for the K-8 context.",
  },
  {
    id: "c003",
    name: "Preethi Kumar",
    date: "2026-04-22",
    duration: "3m 20s",
    messages: 9,
    verdict: "pass",
    weighted_score: 4.7,
    summary:
      "Preethi is one of the strongest candidates screened. Every answer showed deep empathy and a natural teaching voice. Her fraction explanation was the clearest and most age-appropriate of any candidate this week.",
    dimensions: {
      clarity: {
        score: 5,
        evidence: "Let me walk you through exactly what I'd say to the child, step by step",
      },
      simplification: {
        score: 5,
        evidence:
          "You know how when you share a chocolate bar with your friend, you each get half? That half is a fraction — one out of two pieces",
      },
      warmth: {
        score: 5,
        evidence:
          "I'd sit next to them, not across from them — that small thing changes everything about how safe they feel",
      },
      patience: {
        score: 4,
        evidence:
          "I'd ask them to draw what they think is happening — sometimes drawing it unlocks something that words can't",
      },
      fluency: {
        score: 5,
        evidence: "Exceptionally fluent — natural, warm, and precise throughout",
      },
    },
    red_flags: [],
    recommendation: "Highest priority candidate this week. Fast-track to final round immediately.",
  },
  {
    id: "c004",
    name: "Vikram Singh",
    date: "2026-04-21",
    duration: "2m 10s",
    messages: 7,
    verdict: "reject",
    weighted_score: 1.4,
    summary:
      "Vikram's responses were consistently vague and showed little awareness of child-appropriate communication. He became visibly impatient when describing stuck students and showed no adaptive teaching strategy.",
    dimensions: {
      clarity: {
        score: 1,
        evidence: "I am not sure, I would just explain it again",
      },
      simplification: {
        score: 2,
        evidence: "Fractions are basically division, so I'd explain division first",
      },
      warmth: {
        score: 1,
        evidence: "If they still don't get it after I explain it twice, that's a problem on their end",
      },
      patience: {
        score: 1,
        evidence: "I would just give up and move to the next topic honestly",
      },
      fluency: {
        score: 2,
        evidence: "Frequent incomplete sentences and unclear phrasing throughout",
      },
    },
    red_flags: [
      "Expressed giving up on struggling students",
      "Blamed student for lack of understanding",
      "No examples or analogies used in any answer",
    ],
    recommendation: "Do not advance. Fundamental mismatch with Cuemath's teaching philosophy.",
  },
  {
    id: "c005",
    name: "Meera Nair",
    date: "2026-04-20",
    duration: "5m 40s",
    messages: 15,
    verdict: "pass",
    weighted_score: 3.8,
    summary:
      "Meera showed consistent warmth and strong patience. Her simplification was good but occasionally drifted into teacher-speak. Fluency was excellent with natural Indian English accent that posed no comprehension barrier.",
    dimensions: {
      clarity: {
        score: 4,
        evidence:
          "So the top number tells you how many pieces you have, and the bottom tells you how many pieces the whole thing was cut into",
      },
      simplification: {
        score: 3,
        evidence:
          "I'd use a real-life example — maybe sharing food — to make it tangible for the child",
      },
      warmth: {
        score: 5,
        evidence:
          "Teaching is not about getting the right answer, it's about making the child feel capable of getting there",
      },
      patience: {
        score: 4,
        evidence:
          "I'd never move on until they nod — not a polite nod, a real I-actually-get-it nod",
      },
      fluency: {
        score: 4,
        evidence: "Clear, natural, and confident throughout with strong vocabulary",
      },
    },
    red_flags: [],
    recommendation:
      "Recommend advancing. Particularly strong warmth score. Well-suited for younger age groups (grades 1-4).",
  },
];
