# Cuemath Design System — UI Components

Reference for building components that match Cuemath's design language.

---

## 1. Buttons

Cuemath buttons are **neo-brutalist** — bold, bordered, with hard shadows.

### Primary Button (CTA)

```css
.btn-primary {
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 32px;
  background: #FAC02E;            /* Cuemath Yellow */
  color: #1A1A1A;                 /* Ink Black text */
  border: 2px solid #1A1A1A;
  border-radius: 12px;
  box-shadow: 4px 4px 0 #1A1A1A; /* Hard offset shadow */
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #1A1A1A; /* Shadow shrinks — "pressed" feel */
}

.btn-primary:active {
  transform: translate(4px, 4px);
  box-shadow: 0 0 0 #1A1A1A;     /* Fully "pressed in" */
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: 4px 4px 0 #1A1A1A;
}
```

### Secondary Button (outline)

```css
.btn-secondary {
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 32px;
  background: #FFFFFF;
  color: #1A1A1A;
  border: 2px solid #1A1A1A;
  border-radius: 12px;
  box-shadow: 4px 4px 0 #1A1A1A;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: #FFF8E7;            /* Cream tint */
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #1A1A1A;
}
```

### Ghost Button (text-only link)

```css
.btn-ghost {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 0;
  background: transparent;
  color: #1A1A1A;
  border: none;
  border-bottom: 2px solid #1A1A1A;
  border-radius: 0;
  cursor: pointer;
}

.btn-ghost:hover {
  color: #FAC02E;
  border-color: #FAC02E;
}
```

---

## 2. Cards

Cuemath cards are **elevated, bordered containers** with distinct colour fills.

### Standard Card

```css
.card {
  background: #FFFFFF;
  border: 2px solid #1A1A1A;
  border-radius: 16px;
  box-shadow: 6px 6px 0 #1A1A1A;
  padding: 24px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 #1A1A1A; /* Lifts up on hover */
}
```

### Coloured Feature Card (uses the pastel palette)

```css
.card-mint    { background: #C8F0D4; }
.card-lavender { background: #E8D5F5; }
.card-sky     { background: #D0E8FF; }
.card-salmon  { background: #FFD5C8; }
.card-pink    { background: #FFE0EB; }
.card-cream   { background: #FFF8E7; }
```

### Usage in AI Screener

| Card type | AI Screener usage |
|-----------|-------------------|
| Standard (white) | Transcript panel container, AI disclosure card |
| Mint green | Pass verdict card, positive rubric scores |
| Salmon | Review verdict card |
| Pink/red tint | Reject verdict card, red flags section |
| Lavender | Individual rubric dimension cards |
| Cream | Current question banner |

---

## 3. Input Fields

```css
.input {
  font-family: "Inter", sans-serif;
  font-size: 16px;
  padding: 12px 16px;
  background: #FFFFFF;
  color: #1A1A1A;
  border: 2px solid #1A1A1A;
  border-radius: 10px;
  outline: none;
  transition: box-shadow 0.15s;
}

.input:focus {
  box-shadow: 4px 4px 0 #FAC02E;  /* Yellow focus shadow */
}

.input::placeholder {
  color: #999;
}
```

---

## 4. Badges / Tags

```css
.badge {
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 16px;
  border: 2px solid #1A1A1A;
  border-radius: 999px;          /* Pill shape */
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge-pass {
  background: #C8F0D4;
  color: #1A5C2A;
}

.badge-review {
  background: #FFF8E7;
  color: #8B6914;
}

.badge-reject {
  background: #FFD5D5;
  color: #8B1A1A;
}
```

---

## 5. Progress / Score Indicators

Cuemath uses **filled bar indicators** for scores, not star ratings.

```css
.score-bar-track {
  width: 100%;
  height: 10px;
  background: #E5E5E5;
  border: 2px solid #1A1A1A;
  border-radius: 999px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  background: #FAC02E;
  border-radius: 999px;
  transition: width 0.6s ease;
}
```

For a score of 3.5/5, set `width: 70%`.

---

## 6. Checkbox (consent / agreement)

```css
.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #1A1A1A;
  border-radius: 6px;
  background: #FFFFFF;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.checkbox.checked {
  background: #FAC02E;
  box-shadow: 2px 2px 0 #1A1A1A;
}
```

---

## 7. Navigation Bar

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: #FFFFFF;
  border-bottom: 2px solid #1A1A1A;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo {
  font-family: "Poppins", sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #1A1A1A;
}

.nav-cta {
  /* Use .btn-primary styling */
}
```

---

## 8. Testimonial Cards

Cuemath's become-a-tutor page uses **auto-scrolling testimonial carousels** with:

```css
.testimonial-card {
  background: #FFF8E7;
  border: 2px solid #1A1A1A;
  border-radius: 16px;
  box-shadow: 4px 4px 0 #1A1A1A;
  padding: 24px;
  min-width: 300px;
}

.testimonial-quote {
  font-family: "Inter", sans-serif;
  font-size: 15px;
  line-height: 1.6;
  font-style: italic;
  color: #333;
  margin-bottom: 16px;
}

.testimonial-author {
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #1A1A1A;
}
```

---

## 9. Shadows Reference

| Type | CSS | Usage |
|------|-----|-------|
| Card rest | `6px 6px 0 #1A1A1A` | Cards, panels |
| Card hover | `8px 8px 0 #1A1A1A` | Card lift effect |
| Button rest | `4px 4px 0 #1A1A1A` | Buttons |
| Button hover | `2px 2px 0 #1A1A1A` | Button press |
| Button active | `0 0 0 #1A1A1A` | Button fully pressed |
| Focus ring | `4px 4px 0 #FAC02E` | Input focus |
| None (flat) | `none` | Inline text, labels |

All shadows are **hard-offset** (no blur radius). This is the defining visual trait.

---

## 10. Animations & Transitions

### Hover transforms

```css
/* Cards — lift on hover */
.card:hover {
  transform: translate(-2px, -2px);
}

/* Buttons — press on hover */
.btn:hover {
  transform: translate(2px, 2px);
}
```

### Page load — stagger fade-in

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.4s ease forwards;
}

/* Stagger children */
.animate-in:nth-child(1) { animation-delay: 0s; }
.animate-in:nth-child(2) { animation-delay: 0.1s; }
.animate-in:nth-child(3) { animation-delay: 0.2s; }
```

### Interview pulse (mic listening)

```css
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
}

.listening-indicator {
  animation: pulse 1.5s ease-in-out infinite;
}
```

### Global transition default

```css
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

All interactive elements use `0.15s` duration — fast but visible.
