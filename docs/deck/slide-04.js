// Slide 04 — The Solution
// Hero quote + 2x2 pillar grid.

const { THEME, EX, TYPE, SP, addHeader, addPageBadge } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  addHeader(slide, pres, theme, {
    eyebrow: "THE SOLUTION",
    title: "Music Mate, in one sentence",
  });

  // Hero quote band — full width, dark
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: SP.pageMargin, y: 1.95, w: 10 - 2 * SP.pageMargin, h: 1.15,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 },
    rectRadius: 0.2,
  });
  // Quote mark (decorative)
  slide.addText("\u201C", {
    x: SP.pageMargin + 0.3, y: 1.85, w: 0.5, h: 0.8,
    fontSize: 60, fontFace: "Georgia", color: theme.accent, bold: true,
  });
  // Quote text
  slide.addText(
    "A self-hosted web app that streams audio & video from 1,800+ sites straight to your machine — no accounts, no cloud, no friction.",
    {
      x: SP.pageMargin + 0.85, y: 2.05, w: 10 - 2 * SP.pageMargin - 1.0, h: 0.95,
      fontSize: 16, fontFace: "Georgia", color: "FFFFFF", italic: true,
      align: "left", valign: "middle", lineSpacingMultiple: 1.4,
    }
  );

  // 2x2 pillar grid
  const pillars = [
    { title: "Self-hosted",  body: "Runs on your hardware. Data never leaves." },
    { title: "Zero friction", body: "Paste link → click. No signups, no captchas." },
    { title: "All formats",  body: "MP3 / M4A / Opus · MP4 / WebM up to 4K." },
    { title: "SponsorBlock", body: "Auto-skip sponsors, intros, outros." },
  ];

  const colW = (10 - 2 * SP.pageMargin - 0.3) / 2;
  const rowH = 0.85;
  const x0 = SP.pageMargin;
  const y0 = 3.4;

  pillars.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = x0 + col * (colW + 0.3);
    const y = y0 + row * (rowH + 0.15);

    // Accent dot (left)
    slide.addShape(pres.shapes.OVAL, {
      x: x, y: y + 0.18, w: 0.18, h: 0.18,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
    });
    // Title
    slide.addText(p.title, {
      x: x + 0.35, y: y, w: colW - 0.4, h: 0.4,
      fontSize: TYPE.cardTitle, fontFace: "Arial", color: theme.primary,
      bold: true, valign: "middle",
    });
    // Body
    slide.addText(p.body, {
      x: x + 0.35, y: y + 0.4, w: colW - 0.4, h: 0.4,
      fontSize: TYPE.body, fontFace: "Arial", color: theme.secondary,
      valign: "top",
    });
  });

  addPageBadge(slide, pres, theme, 4);
  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 4 } };