# Project Analysis — Vijay Girange Portfolio

## Structure
```
portfolio/
├── assets/
│   └── profile.jpg          (38KB, profile photo)
├── fonts/
│   ├── InstrumentSerif-Italic.ttf   (69KB)
│   ├── InstrumentSerif-Regular.ttf  (68KB)
│   ├── JetBrainsMono-Bold.ttf      (112KB)
│   ├── JetBrainsMono-Regular.ttf   (112KB)
│   ├── Tektur-Medium.ttf           (75KB)
│   └── Tektur-Regular.ttf          (74KB)
├── favicon.ico
├── FORMAL_METHODS.md      (Visual philosophy document)
├── index.html              (333 lines, 7 sections)
├── script.js               (655 lines, 8 classes)
├── styles.css              (1373 lines, design system)
└── Vijay_Girange_Senior_Java_Developer_Resume(1).pdf
```

## Sections (in order)
1. **Hero** — Canvas particles, typewriter, CTA buttons, scroll indicator
2. **About** — Bio, details (GitHub/email/degree/location), social links
3. **Skills** — 8 skill rings with SVG arc animation
4. **Projects** — 3 cards (Enterprise App, Web Platform, Data Pipeline)
5. **Video Intro** — SpeechSynthesis AI avatar with orbital rings and captions
6. **Contact** — Form (name/email/message) + info sidebar
7. **Footer** — Visitor counter, social links, copyright

## Technical Details
- **Form**: Formspree endpoint (https://formspree.io/f/mlgvlrpn)
- **Visitor Counter**: CountAPI (https://api.countapi.xyz/hit/vijaygirange-portfolio/visitors)
- **Resume link**: points to "resume.pdf" but the actual file is named "Vijay_Girange_Senior_Java_Developer_Resume(1).pdf"
- **AI Intro**: Uses Web SpeechSynthesis API with word-by-word caption highlighting
- **Canvas**: Custom particle system with mouse interaction (repulsion force)

## Observations
- Resume filename has "(1)" suffix — should be renamed
- No Google Analytics or tracking
- No meta OG tags for social sharing
- No manifest.json for PWA
- No light mode (dark only)
- Fonts are self-hosted (good for performance)
- GitHub social link is present twice (about + footer)
