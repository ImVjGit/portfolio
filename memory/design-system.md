# Design System — Portfolio Redesign

Generated from UI/UX Pro Max guidelines for **Vijay Girange — Senior Java Developer Portfolio**

## Aesthetic Direction

| Attribute | Choice | Reasoning |
|-----------|--------|-----------|
| Style | Industrial Brutalist + Warm Editorial | Backend dev persona — solid, structured, warm authority |
| Tone | Refined, architectural, confident | Matches "Senior Java Developer" positioning |
| Philosophy | FORMAL_METHODS — rigorous structure, geometric purity | Already defined by project owner |
| Differentiation | Asymmetric bento-grid layout + ember glow effects | Avoids template-like centered portfolios |

## Color System

```css
--bg-deep:     #0f1117;  /* Deep foundry floor */
--bg-surface:  #181b24;  /* Subtle raise */
--bg-card:     #1e2230;  /* Card surface */
--text:        #e8e6e1;  /* Warm white */
--text-muted:  #8b8f9e;  /* Cool gray */
--accent:      #d94a2d;  /* Burnt ember */
--accent-glow: rgba(217,74,45,0.15);
--border:      rgba(232,230,225,0.06);
```

## Typography System

| Role | Font | Weight | Size |
|------|------|--------|------|
| Display/Hero | Tektur | 500 | clamp(48px, 8vw, 100px) |
| Headings | Tektur | 500 | clamp(24px, 3vw, 40px) |
| Body | Instrument Serif | 400 | 17px |
| Code/Label | JetBrains Mono | 400 | 11-13px |
| Small/Detail | JetBrains Mono | 400 | 10px |

## Spacing Scale (8pt system)
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128

## Layout Strategy
- **Desktop**: Asymmetric 2-column grid with offset sections
- **Tablet**: Single column with staggered content
- **Mobile**: Single column, full-width
- **Max-width**: 1200px container

## Effects
- **Glow**: Radial gradient ember glow on hero accent elements
- **Grain**: Noise texture overlay (keep existing)
- **Borders**: Hairline 1px, low opacity
- **Shadow**: Deep, warm-tinted on hover (0 20px 60px rgba(217,74,45,0.08))

## Animation Principles
- Duration: 200-400ms micro, 600-800ms reveals
- Easing: Custom cubic-bezier(0.22, 1, 0.36, 1)
- Stagger: 80ms between elements
- Motion: transform/opacity only, never layout
- Reduced motion: Respect prefers-reduced-motion

## UI/UX Pro Max Guidelines Applied
- §1: Color contrast 4.5:1+, focus rings, aria-labels, skip link
- §2: Touch targets 44×44pt+ (social icons were 40px)
- §3: font-display: swap, lazy loading, CLS prevention
- §4: SVG icons only, consistency, dark mode pairing
- §5: Mobile-first breakpoints, no horizontal scroll, dvh units
- §6: Semantic color tokens, font-scale, line-height 1.6
- §7: 150-300ms micro-interactions, transform/opacity only
- §8: Visible labels, error placement, inline validation
- §9: Nav active state, predictable back, deep linking
