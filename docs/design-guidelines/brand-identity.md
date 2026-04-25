# Cuemath Design System — Brand Identity

Reference document for replicating Cuemath's visual language in the AI Tutor Screener.

> **Source pages analyzed:**
> - [cuemath.com/en-in/](https://www.cuemath.com/en-in/) — main homepage
> - [cuemath.com/en-in/become-a-tutor/](https://www.cuemath.com/en-in/become-a-tutor/) — tutor-facing page

---

## 1. Design Philosophy

Cuemath uses a **Neo-Brutalist** aesthetic — a modern design trend characterised by:
- **Bold, thick borders** (2px+ black outlines on nearly everything)
- **Flat, unblurred shadows** (hard offset `4px 4px 0 #000`)
- **Bright, opinionated colours** (primary yellow against muted pastels)
- **Mathematical grid patterns** as subtle background textures
- **Playful but professional** — approachable for kids, credible for parents

This is the opposite of soft glassmorphism or minimal SaaS aesthetics. It's **loud, confident, geometric** — fitting for a math education brand.

---

## 2. Colour Palette

### Primary colours

| Swatch | Name | Hex | Usage |
|--------|------|-----|-------|
| 🟡 | **Cuemath Yellow** | `#FAC02E` | Primary brand colour. CTAs, hero backgrounds, accent fills |
| ⬛ | **Ink Black** | `#1A1A1A` | Text, borders, hard shadows, button hovers |
| ⬜ | **Clean White** | `#FFFFFF` | Page background, card backgrounds, text on dark |

### Accent palette (section backgrounds & cards)

| Swatch | Name | Hex | Usage |
|--------|------|-----|-------|
| 🟢 | **Mint Green** | `#C8F0D4` | Benefit cards, success states |
| 🟣 | **Soft Lavender** | `#E8D5F5` | Feature highlights, secondary cards |
| 🔵 | **Sky Blue** | `#D0E8FF` | Info sections, subtle backgrounds |
| 🟠 | **Warm Salmon** | `#FFD5C8` | Warm/empathy sections, testimonials |
| 🩷 | **Blush Pink** | `#FFE0EB` | Trust/human-touch sections |
| 🟤 | **Cream** | `#FFF8E7` | Alternate section backgrounds |

### Semantic colours

| Name | Hex | Usage |
|------|-----|-------|
| Success Green | `#2EA043` | Pass badges, positive indicators |
| Warning Amber | `#D4A017` | Review badges, cautionary states |
| Error Red | `#D93025` | Reject badges, error states |

### Colour usage rules

1. **Yellow is never used for text** — always backgrounds or fills
2. **Black borders on everything interactive** — buttons, cards, inputs
3. **Pastel backgrounds rotate per section** — no two adjacent sections use the same colour
4. **High contrast** — always dark text on light backgrounds (WCAG AA+ compliant)

---

## 3. Typography

### Font stack

```
Primary: "Poppins", sans-serif    — headings, CTAs, large text
Body:    "Inter", sans-serif       — body copy, descriptions
Mono:    "JetBrains Mono", monospace — code, scores, numbers
```

**Google Fonts link:**
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Type scale

| Element | Font | Size | Weight | Line-height | Letter-spacing |
|---------|------|------|--------|-------------|----------------|
| Hero headline (h1) | Poppins | 48–56px | 800 (ExtraBold) | 1.1 | -0.02em |
| Section title (h2) | Poppins | 32–40px | 700 (Bold) | 1.2 | -0.01em |
| Card title (h3) | Poppins | 20–24px | 600 (SemiBold) | 1.3 | 0 |
| Body text | Inter | 16px | 400 | 1.6 | 0 |
| Small / caption | Inter | 13–14px | 500 | 1.4 | 0.02em |
| Button text | Poppins | 16px | 600 | 1 | 0.02em |
| Eyebrow label | Inter | 12px | 700 | 1 | 0.1em (uppercased) |
| Score / number | JetBrains Mono | 44px | 700 | 1 | 0 |

### Typography rules

1. **Headings are always Poppins, always bold/extrabold** — never thin or light
2. **Body text is always Inter** — never Poppins (reserve Poppins for emphasis)
3. **Scores and numerical data use monospace** — creates a "dashboard" feel
4. **Eyebrow labels** above section titles: uppercase, tiny, letter-spaced, muted colour

---

## 4. The Grid Background

Cuemath uses a **subtle square grid pattern** as a background texture in many sections. This is a signature element — it subtly references graph paper / mathematics without being distracting.

### CSS implementation

```css
.grid-bg {
  background-image:
    linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

### Where to use it

- Landing page hero background
- Interview page background (behind the transcript panel)
- Report page background (behind the assessment)
- **Not** inside cards or elevated components (only on the page canvas)

---

## 5. Iconography Style

Cuemath uses **bold line-art icons** with 2px stroke weight:
- Rounded line caps and joins
- Single colour (black or brand accent)
- No fills — purely outline
- Simple, geometric shapes

For our app, use icons from [Lucide](https://lucide.dev/) or [Phosphor](https://phosphoricons.com/) with `stroke-width: 2` to match the Cuemath style.

---

## 6. Spacing System

Cuemath uses an **8px base unit** spacing system:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps (icon + text) |
| `--space-2` | 8px | Inner padding, small gaps |
| `--space-3` | 12px | Medium gaps |
| `--space-4` | 16px | Card inner padding |
| `--space-5` | 24px | Section inner padding |
| `--space-6` | 32px | Between card groups |
| `--space-8` | 48px | Between major sections |
| `--space-10` | 64px | Hero padding top/bottom |
| `--space-12` | 80px | Page section padding |

### Rules

1. **Never use arbitrary pixel values** — always reference the scale
2. **Vertical rhythm** — use `--space-8` to `--space-12` between page sections
3. **Card padding** — always `--space-4` to `--space-5` (16–24px)
4. **Button padding** — `12px 24px` (horizontal emphasis)
