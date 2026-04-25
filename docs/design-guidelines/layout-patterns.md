# Cuemath Design System — Layout Patterns

How Cuemath structures pages, sections, and responsive layouts.

---

## 1. Page Structure

Every Cuemath page follows this macro layout:

```
┌── Sticky Navbar ──────────────────────────────────────┐
│                                                       │
├── Hero Section (full-width, coloured bg) ─────────────┤
│                                                       │
├── Content Section 1 (alternating bg colour) ──────────┤
│                                                       │
├── Content Section 2 (different pastel bg) ────────────┤
│                                                       │
├── Social Proof / Testimonials ────────────────────────┤
│                                                       │
├── CTA Section (yellow bg) ────────────────────────────┤
│                                                       │
└── Footer ─────────────────────────────────────────────┘
```

### Key rules

1. **Every section has a distinct background colour** — they alternate between white, cream, and pastels. No two adjacent sections have the same colour.
2. **Content is max-width constrained** — typically `max-width: 1200px; margin: 0 auto`.
3. **Section padding is generous** — `80px` top/bottom on desktop, `48px` on mobile.
4. **Full-bleed backgrounds** — the coloured background spans 100vw, but the content inside is constrained.

---

## 2. Section Layout Pattern

```css
.section {
  width: 100%;
  padding: 80px 24px;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
}
```

### Alternating background colours

```css
.section:nth-child(odd)  { background: #FFFFFF; }
.section:nth-child(even) { background: #FFF8E7; }

/* Or use explicit classes for control: */
.section-white   { background: #FFFFFF; }
.section-cream   { background: #FFF8E7; }
.section-mint    { background: #C8F0D4; }
.section-lavender { background: #E8D5F5; }
.section-yellow  { background: #FAC02E; }
```

---

## 3. Card Grid Layouts

### 2-column grid (rubric cards on Report page)

```css
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 640px) {
  .grid-2 { grid-template-columns: 1fr; }
}
```

### 3-column grid (features / how-it-works on Landing)

```css
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .grid-3 { grid-template-columns: 1fr; }
}
```

### Flex row (buttons, badges, action bars)

```css
.flex-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
```

---

## 4. Hero Section Pattern

```
┌─────────────────────────────────────────┐
│                                         │
│  [Eyebrow label — small, uppercased]    │
│  [H1 — 48px, Poppins 800]              │
│  [Subtitle — 18px, Inter 400, muted]   │
│                                         │
│  [CTA Button ▸]  [Secondary Button]    │
│                                         │
│  [Trust badges: "4.9★ on Trustpilot"]  │
│                                         │
└─────────────────────────────────────────┘
```

```css
.hero {
  text-align: center;
  padding: 80px 24px 64px;
  background: #FFF8E7;  /* Cream */
}

.hero h1 {
  font-family: "Poppins", sans-serif;
  font-weight: 800;
  font-size: 48px;
  line-height: 1.1;
  margin-bottom: 16px;
}

.hero .subtitle {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto 32px;
}

@media (max-width: 640px) {
  .hero h1 { font-size: 32px; }
  .hero .subtitle { font-size: 16px; }
  .hero { padding: 48px 16px 40px; }
}
```

---

## 5. Two-Column Split Layout

Used on the become-a-tutor page — text on one side, image/illustration on the other.

```
┌──────────────┬───────────────┐
│              │               │
│  Text side   │  Visual side  │
│  H2, body,   │  Image or     │
│  CTA button  │  illustration │
│              │               │
└──────────────┴───────────────┘
```

```css
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.split-reverse {
  direction: rtl;  /* Flip text and visual sides */
}
.split-reverse > * {
  direction: ltr;   /* Reset text direction */
}

@media (max-width: 768px) {
  .split {
    grid-template-columns: 1fr;
    gap: 32px;
    text-align: center;
  }
}
```

---

## 6. Stats / Numbers Row

Cuemath shows impact numbers in a horizontal row:

```
┌─────────┬─────────┬─────────┬─────────┐
│  200K+  │  40+    │  4.9★   │  10K+   │
│ Students│Countries│ Rating  │ Reviews │
└─────────┴─────────┴─────────┴─────────┘
```

```css
.stats-row {
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 40px 24px;
  border: 2px solid #1A1A1A;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 6px 6px 0 #1A1A1A;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-family: "Poppins", sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #FAC02E;
}

.stat-label {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}
```

---

## 7. Responsive Breakpoints

| Breakpoint | Target | Changes |
|------------|--------|---------|
| `> 1200px` | Desktop | Full layout, 3-column grids, side-by-side splits |
| `768–1200px` | Tablet | 2-column grids, smaller headings |
| `< 768px` | Mobile | Single column, stacked content, hamburger nav |
| `< 480px` | Small mobile | Reduced padding, compact typography |

```css
/* Mobile-first breakpoint mixins */
@media (min-width: 768px) { /* Tablet+ */ }
@media (min-width: 1200px) { /* Desktop+ */ }
```

---

## 8. Z-Index Scale

| Layer | z-index | Element |
|-------|---------|---------|
| Background grid | 0 | `.grid-bg` |
| Content | 1 | Default |
| Cards (elevated) | 10 | `.card` |
| Sticky nav | 100 | `.navbar` |
| Modal overlay | 200 | `.modal-backdrop` |
| Toast / notification | 300 | `.toast` |
