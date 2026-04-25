# Applying Cuemath Design to the AI Tutor Screener

Step-by-step guide for transforming each page of the AI Screener to match
Cuemath's neo-brutalist design language.

> **Read `brand-identity.md` and `components.md` first.** This doc assumes
> you've absorbed the colour palette, typography, and component CSS from those files.

---

## Overview — What Changes Per Page

| Page | Current style | Target Cuemath style |
|------|---------------|----------------------|
| **Landing** | Minimal, soft shadows, accent-purple | Yellow CTAs, black borders, grid background, bold Poppins headings |
| **Interview** | Plain transcript panel, purple accent | Bordered transcript panel, cream question banner, grid bg, bold status |
| **Report** | Soft card layout, purple accents | Hard-shadow cards, pastel rubric cards, score bars, bold typography |

---

## Page 1 — Landing Page

### Structure map

```
┌─ Navbar ─────────────────────────────────────────┐
│  Logo (Poppins 800)          [Start Interview] CTA│
├──────────────────────────────────────────────────────┤
│                                                    │
│  ┌─ Hero Section (grid-bg, cream bg) ──────────┐  │
│  │  Eyebrow: "CUEMATH AI SCREENING"             │  │
│  │  H1: "Meet Priya, Your AI Interviewer"       │  │
│  │  Body: "A 5-minute voice conversation..."     │  │
│  │  [Begin Interview →] yellow btn, hard shadow  │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ How It Works (3 cards, horizontal) ────────┐  │
│  │  [Mint]         [Lavender]       [Sky]       │  │
│  │  🎤 Speak       🤖 AI Listens    📊 Report  │  │
│  │  "Answer in     "Priya asks      "Get your   │  │
│  │   your own       follow-up        score in    │  │
│  │   words"         questions"       seconds"    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ AI Disclosure Card (bordered, cream bg) ────┐  │
│  │  ℹ️ About This Interview                      │  │
│  │  "Priya is an AI interviewer powered by..."   │  │
│  │  ☐ I understand and consent to proceed        │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ Browser Requirements ──────────────────────┐  │
│  │  ✅ Chrome Desktop  ✅ Microphone            │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ Footer ──────────────────────────────────────┐  │
│  │  Built for Cuemath | Privacy | Terms          │  │
│  └──────────────────────────────────────────────┘  │
```

### CSS changes to `Landing.css`

```css
/* 1. Add grid background to the whole page */
.landing {
  background-image:
    linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* 2. Replace all existing buttons with .btn-primary from components.md */

/* 3. Update heading font to Poppins 800 */
.landing h1 {
  font-family: "Poppins", sans-serif;
  font-weight: 800;
  font-size: 48px;
  color: #1A1A1A;
}

/* 4. Add eyebrow above the title */
.hero-eyebrow {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #FAC02E;
}

/* 5. Cards get borders + hard shadows */
.landing-card {
  border: 2px solid #1A1A1A;
  box-shadow: 6px 6px 0 #1A1A1A;
  border-radius: 16px;
}
```

---

## Page 2 — Interview Page

### Structure map

```
┌─ Navbar (sticky) ────────────────────────────────┐
│  Cuemath Logo           Question 3 of 7    2:34  │
├──────────────────────────────────────────────────────┤
│                                                    │
│  ┌─ Status Indicator ────────────────────────────┐ │
│  │  [Pulsing mic icon]                            │ │
│  │  "Listening..."                                │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌─ Current Question (cream card, border) ────────┐│
│  │  💬 PRIYA ASKED                                ││
│  │  "How would you explain fractions to a          ││
│  │   9-year-old who's never seen them before?"     ││
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌─ Transcript Panel (white card, border) ────────┐│
│  │  Priya                                         ││
│  │  [AI bubble — light grey bg, left-aligned]     ││
│  │                                                ││
│  │                              You               ││
│  │  [User bubble — yellow bg, right-aligned]      ││
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌─ Footer bar ──────────────────────────────────┐ │
│  │  Question 3 of 7                    2:34       │ │
│  └──────────────────────────────────────────────┘ │
```

### Key CSS changes to `Interview.css`

```css
/* Grid background */
.interview {
  background-image:
    linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Transcript panel — bordered card */
.transcript-panel {
  border: 2px solid #1A1A1A;
  box-shadow: 6px 6px 0 #1A1A1A;
  border-radius: 16px;
  background: #FFFFFF;
}

/* User bubbles — Cuemath Yellow */
.msg-user .msg-bubble {
  background: #FAC02E;
  color: #1A1A1A;
  border: 2px solid #1A1A1A;
  border-radius: 14px 14px 4px 14px;
}

/* AI bubbles — light cream */
.msg-ai .msg-bubble {
  background: #FFF8E7;
  color: #1A1A1A;
  border: 2px solid #1A1A1A;
  border-radius: 14px 14px 14px 4px;
}

/* Current question banner */
.current-question {
  background: #FFF8E7;
  border: 2px solid #1A1A1A;
  border-left: 6px solid #FAC02E;
  box-shadow: 4px 4px 0 #1A1A1A;
  border-radius: 12px;
}
```

---

## Page 3 — Report Page

### Structure map

```
┌─ Header ─────────────────────────────────────────┐
│  INTERVIEW ASSESSMENT                             │
│  Ankit Kumar              [Print] [Download]      │
│  26 April 2026                                    │
├──────────────────────────────────────────────────────┤
│                                                    │
│  ┌─ Verdict Card (full-width, pastel fill) ────────┐│
│  │  [PASS badge — mint bg, bordered pill]         ││
│  │  Score: 4.2 / 5.0                              ││
│  │  ┌─ Radar Chart (SVG, 5 axes) ──────────────┐ ││
│  │  │  [spider chart showing all dimensions]     │ ││
│  │  └──────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌─ Summary (cream card, bordered) ──────────────┐ │
│  │  "Ankit demonstrated strong communication..." │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌─ Dimensions (2×3 grid of coloured cards) ──────┐│
│  │  ┌─ Mint ──┐  ┌─ Lavender ─┐                  ││
│  │  │ Clarity │  │ Warmth     │                  ││
│  │  │ ████░░  │  │ █████░    │                  ││
│  │  │ 4/5     │  │ 5/5       │                  ││
│  │  │ evidence│  │ evidence  │                  ││
│  │  └─────────┘  └───────────┘                  ││
│  │  ┌─ Sky ───┐  ┌─ Salmon ──┐                  ││
│  │  │ Patience│  │ Simplify │                  ││
│  │  │ █████░ │  │ ████░░   │                  ││
│  │  └─────────┘  └───────────┘                  ││
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌─ Red Flags (if any — bordered, salmon bg) ───┐  │
│  │  ⚠️ "Candidate struggled with..."             │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ Recommendation (bordered, white) ────────────┐ │
│  │  "Recommend advancing to round 2..."           │ │
│  └──────────────────────────────────────────────┘ │
```

### Key CSS changes to `Report.css`

```css
/* Bordered verdict card */
.report-verdict {
  border: 2px solid #1A1A1A;
  box-shadow: 6px 6px 0 #1A1A1A;
  border-radius: 16px;
  background: #FFFFFF;
}

/* Rubric cards — each dimension gets a unique pastel */
.rubric-card:nth-child(1) { background: #C8F0D4; }  /* Mint */
.rubric-card:nth-child(2) { background: #E8D5F5; }  /* Lavender */
.rubric-card:nth-child(3) { background: #D0E8FF; }  /* Sky */
.rubric-card:nth-child(4) { background: #FFD5C8; }  /* Salmon */
.rubric-card:nth-child(5) { background: #FFE0EB; }  /* Pink */

.rubric-card {
  border: 2px solid #1A1A1A;
  box-shadow: 4px 4px 0 #1A1A1A;
  border-radius: 12px;
}

/* Badge — bordered pill */
.verdict-badge {
  border: 2px solid #1A1A1A;
  font-family: "Poppins", sans-serif;
  font-weight: 700;
}

/* Score number — monospace */
.verdict-score-num {
  font-family: "JetBrains Mono", monospace;
}
```

---

## CSS Variables to Replace

Replace your current `index.css` `:root` block with the Cuemath palette:

```css
:root {
  /* Cuemath palette */
  --bg: #FFFFFF;
  --surface: #FFFFFF;
  --text: #1A1A1A;
  --text-muted: #666666;
  --border: #1A1A1A;
  --accent: #FAC02E;
  --accent-soft: #FFF8E7;

  /* Chat bubbles */
  --user-bg: #FAC02E;
  --user-fg: #1A1A1A;
  --ai-bg: #FFF8E7;
  --ai-fg: #1A1A1A;

  /* Semantic */
  --success: #2EA043;
  --success-bg: #C8F0D4;
  --warn: #D4A017;
  --warn-bg: #FFF8E7;
  --danger: #D93025;
  --danger-bg: #FFD5D5;

  /* Shadows */
  --shadow-sm: 4px 4px 0 #1A1A1A;
  --shadow-md: 6px 6px 0 #1A1A1A;
  --shadow-lg: 8px 8px 0 #1A1A1A;

  /* Typography */
  font-family: "Inter", sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: "Poppins", sans-serif;
}
```

---

## Implementation Order

1. **Add Google Fonts** — Poppins + Inter to `index.html`
2. **Replace `:root` variables** in `index.css` with the Cuemath palette above
3. **Add grid background** to Landing, Interview, and Report pages
4. **Update buttons** — add borders + hard shadows
5. **Update cards** — add borders + hard shadows + pastel fills
6. **Update chat bubbles** — yellow user, cream AI, both bordered
7. **Update badges** — bordered pills with pastel fills
8. **Update typography** — Poppins for headings, Inter for body
9. **Add stagger animations** — `fadeInUp` on page load
10. **Test on Chrome** — verify everything looks cohesive

**Estimated effort:** ~2–3 hours for all three pages.
