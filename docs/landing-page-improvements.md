# Landing Page Improvement Suggestions

Based on an analysis of Cuemath's official website (specifically the "Become a Tutor" page), here are several elements you can add to the `Landing.jsx` page to make it look even more professional and align perfectly with Cuemath's marketing style. 

*Note: No code changes have been made to your `Landing.jsx` file as requested. These are suggestions you can implement in the future.*

---

## 1. The "Impact Stats" Row
Cuemath heavily uses numbers to build trust. Right below the Hero section, you should add a neo-brutalist stats row.
**What to add:**
A horizontal flex row (like the one documented in `layout-patterns.md`) with 4 data points.
*   **10,000+** (Tutors Screened)
*   **4.9/5** (Candidate Rating)
*   **5 Mins** (Average Time)
*   **100%** (Unbiased AI)

## 2. Testimonial Carousel
The official Cuemath tutor page features quotes from happy tutors. Adding social proof about the AI interviewer will ease candidate anxiety.
**What to add:**
A section with 2-3 pastel-colored cards containing italicized quotes.
*   *"The AI screening was so natural! It felt like a real conversation and I wasn't stressed at all." — Anjali, Math Tutor*
*   *"I loved that I could take the interview at 10 PM. No scheduling conflicts!" — Rahul, Cuemath Teacher*

## 3. "Why Teach with Cuemath" Split Section
Currently, the landing page only explains *how* the interview works, but not *why* they should want the job.
**What to add:**
A 2-column split layout (Text on left, Illustration on right). 
*   **Headline:** Join a community of passionate educators.
*   **Bullet points:** Earn from home, flexible hours, world-class curriculum provided.
*   **Visual:** A neo-brutalist illustration or photo of a happy tutor.

## 4. Frequently Asked Questions (FAQ) Accordion
Almost all Cuemath landing pages end with an FAQ section to handle objections.
**What to add:**
A simple list or accordion answering common candidate fears about the AI.
*   **What if my internet disconnects?** (Answer: You can restart the process.)
*   **Does the AI judge my accent?** (Answer: No, Priya only evaluates your clarity and pedagogy, not your regional accent.)
*   **When will I hear back?** (Answer: The recruiting team reviews Priya's report and will contact you within 48 hours.)

## 5. Trust Signals & Footer Expansion
The current footer is very minimal. Cuemath's footer is rich with links and trust signals.
**What to add:**
*   Add logos of compliance (e.g., "DPDP Compliant", "End-to-End Encrypted").
*   Add links to Cuemath's real Privacy Policy and Terms of Service to make the demo feel like a true production site.

---

### How to implement these later:
When you are ready to add these, refer back to the `docs/design-guidelines/layout-patterns.md` and `docs/design-guidelines/components.md` for the exact CSS classes (like `.split`, `.stats-row`, and `.testimonial-card`) needed to build them in the neo-brutalist style.
