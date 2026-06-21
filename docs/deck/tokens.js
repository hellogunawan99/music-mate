// Shared design tokens & helper functions for the deck.
// Single source of truth so every slide uses the same:
//   - colors (5 contract + extended)
//   - type scale (6 sizes)
//   - spacing (consistent paddings/margins)
//   - card patterns

// Strict 5-key contract colors
const THEME = {
  primary:   "0F0F12", // ink — primary text, dark slide bg
  secondary: "52525B", // muted — body text
  accent:    "8B5CF6", // violet — brand accent
  light:     "FBBF24", // amber — secondary accent / highlights
  bg:        "FAFAFA", // light slide background
};

// Extensions — derived neutrals (not part of contract, used inline)
const EX = {
  inkSubtle:   "8A8A92",
  surface:     "FFFFFF",
  surfaceAlt:  "F4F4F5",
  line:        "E8E8EC",
  lineStrong:  "D4D4D8",
  accentSoft:  "F5F3FF",
  accentLight: "EDE9FE",
};

// 6-step type scale (point sizes). Pick from this list — nothing else.
const TYPE = {
  display:   64,  // hero / cover
  title:     36,  // slide title
  subtitle:  20,  // sub-title under hero
  cardTitle: 16,  // card heading
  body:      13,  // body / description
  caption:   10,  // tiny labels
};

// Spacing tokens (inches)
const SP = {
  pageMargin:    0.6,
  cardPadding:   0.3,
  cardGap:       0.3,
  blockGap:      0.5,
  eyebrowToTitle: 0.15,
  titleToContent: 0.55,
};

// Slide dimensions: 10" wide × 5.625" tall

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Top-of-content-slide header: eyebrow tag + title.
 * Use this on every content slide for consistent header treatment.
 */
function addHeader(slide, pres, theme, { eyebrow, title }) {
  if (eyebrow) {
    slide.addText(eyebrow.toUpperCase(), {
      x: SP.pageMargin, y: 0.4, w: 9, h: 0.3,
      fontSize: TYPE.caption, fontFace: "Arial",
      color: theme.accent, bold: true, charSpacing: 5,
    });
  }
  if (title) {
    slide.addText(title, {
      x: SP.pageMargin, y: 0.75, w: 9, h: 0.7,
      fontSize: TYPE.title, fontFace: "Arial",
      color: theme.primary, bold: true,
    });
  }
  // Accent underline
  slide.addShape(pres.shapes.RECTANGLE, {
    x: SP.pageMargin, y: 1.5, w: 0.45, h: 0.05,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
  });
}

/**
 * Page badge — bottom right. Call once per slide (except cover).
 */
function addPageBadge(slide, pres, theme, n) {
  slide.addShape(pres.shapes.OVAL, {
    x: 9.25, y: 5.15, w: 0.4, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
  });
  slide.addText(String(n), {
    x: 9.25, y: 5.15, w: 0.4, h: 0.4,
    fontSize: 11, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle",
  });
}

/**
 * Standard content card with optional accent top bar.
 * Caller passes content blocks (text/image) AFTER calling this.
 */
function addCard(slide, pres, opts) {
  const {
    x, y, w, h,
    theme,
    accent = false, // adds a thin accent bar at the top
  } = opts;

  // Card surface
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: EX.surface },
    line: { color: EX.line, width: 1 },
    rectRadius: 0.15,
  });

  // Accent bar (top)
  if (accent) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.18, y: y, w: w - 0.36, h: 0.05,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
    });
  }
}

/**
 * Eyebrow tag pill (e.g. category label).
 */
function addTagPill(slide, pres, theme, { x, y, w = 0.7, label }) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h: 0.26,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
    rectRadius: 0.04,
  });
  slide.addText(label.toUpperCase(), {
    x, y, w, h: 0.26,
    fontSize: TYPE.caption, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle", charSpacing: 2,
  });
}

module.exports = {
  THEME, EX, TYPE, SP,
  addHeader, addPageBadge, addCard, addTagPill,
};