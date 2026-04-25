# Assessment Rubric — Scoring Criteria

## Overview
5 dimensions, each scored 1–5. Overall score is a weighted average.
Weights: Clarity (25%), Simplification (25%), Warmth (20%), Patience (20%), Fluency (10%).
Overall decision: Pass (≥3.5 weighted), Review (2.5–3.4), Reject (<2.5).

## Dimension 1: Communication Clarity (25%)
Is the candidate easy to understand? Do sentences have a clear beginning and end?
Does the answer directly address the question?

| Score | Criteria |
|-------|----------|
| 5 | Every answer is immediately clear. Ideas are organized. No rambling. The listener never has to work to understand. |
| 4 | Generally clear with one or two moments of vagueness. Self-corrects quickly. |
| 3 | Understandable but requires listener effort. Some run-on sentences or topic jumps. |
| 2 | Frequently unclear. Ideas not logically connected. Listener loses the point mid-answer. |
| 1 | Very difficult to understand due to disorganized thinking, not just accent. |

## Dimension 2: Ability to Simplify (25%)
Can the candidate explain something complex in age-appropriate terms?
Do they use concrete examples, analogies, or real objects?

| Score | Criteria |
|-------|----------|
| 5 | Spontaneously uses a concrete example (pizza, sharing, real objects). Checks for understanding. Language is explicitly child-level. |
| 4 | Uses an example when prompted or uses simplified language without being asked. |
| 3 | Understands the need to simplify but explanation is still abstract or uses some jargon. |
| 2 | Defines a term using other technical terms. Does not naturally shift to child-level language. |
| 1 | Would confuse a 9-year-old. No awareness of audience. |

## Dimension 3: Warmth (20%)
Does the candidate sound like someone children would want to learn from?
Is there genuine enthusiasm, empathy, and encouragement in their tone?

| Score | Criteria |
|-------|----------|
| 5 | Radiates care. Language is encouraging and positive. You can hear a smile. Would make a nervous child feel safe immediately. |
| 4 | Warm and friendly. Positive tone throughout with genuine enthusiasm. |
| 3 | Neutral and professional but not cold. Warmth present in content but not delivery. |
| 2 | Transactional. Focused on content delivery, not the emotional experience of the student. |
| 1 | Robotic, dismissive, or condescending in any answer. |

## Dimension 4: Patience (20%)
When describing how they handle a struggling student, do they show they would
stay calm, try multiple approaches, and not make the student feel bad?

| Score | Criteria |
|-------|----------|
| 5 | Explicitly diagnoses why the student is stuck before re-explaining. Tries a different angle. Normalizes struggle. ("It's okay, this part is tricky for everyone.") |
| 4 | Shows they would try a different approach. Empathetic framing. |
| 3 | Says they'd be patient but doesn't demonstrate HOW. Generic "I'd explain it differently." |
| 2 | Would re-explain the same way faster or louder. No adaptive strategy visible. |
| 1 | Any sign of frustration, blame, or the student being at fault for not understanding. |

## Dimension 5: English Fluency (10%)
This is a supporting dimension, not the primary signal. Cuemath operates globally
and hires non-native speakers. This assesses whether fluency is a barrier to
teaching, not whether the candidate speaks with an accent.

| Score | Criteria |
|-------|----------|
| 5 | Native or near-native fluency. No grammar errors that interrupt meaning. |
| 4 | Minor grammatical errors that don't affect comprehension. Vocabulary is appropriate. |
| 3 | Some errors but consistently understandable. Vocabulary occasionally limited. |
| 2 | Errors frequently cause confusion. The listener must infer meaning. |
| 1 | Unable to construct clear sentences. Would be a barrier to student learning. |

## Evidence extraction rules for LLM
When generating the assessment JSON, the AI must:
1. Pull a direct quote from the transcript for each dimension's evidence field.
2. Quote must be the candidate's words (role: user), not the AI's words.
3. Quote must be the best (or worst) moment that justifies the score.
4. Quote must be under 30 words.
5. If no good quote exists for a dimension, use "Insufficient evidence to quote."

## JSON output schema
{
  "overall": "pass" | "review" | "reject",
  "weighted_score": 3.8,
  "summary": "string, 2-3 sentences, objective tone",
  "dimensions": {
    "clarity":         { "score": 4, "evidence": "quote from candidate" },
    "simplification":  { "score": 5, "evidence": "quote from candidate" },
    "warmth":          { "score": 3, "evidence": "quote from candidate" },
    "patience":        { "score": 4, "evidence": "quote from candidate" },
    "fluency":         { "score": 4, "evidence": "quote from candidate" }
  },
  "red_flags": ["list strings, empty array if none"],
  "recommendation": "string, 1-2 sentences, specific action for HR"
}