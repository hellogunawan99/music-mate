// Slide 07 — Features
// 2x3 grid with generous padding. Each card: category tag + title + body.

const { THEME, EX, TYPE, SP, addHeader, addPageBadge, addCard, addTagPill } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  addHeader(slide, pres, theme, {
    eyebrow: "FEATURES",
    title: "Everything you'd want, nothing you don't",
  });

  const features = [
    { tag: "AUDIO",   title: "MP3 / M4A / Opus",    body: "Bitrate control: 128 / 192 / 320 kbps" },
    { tag: "VIDEO",   title: "MP4 / WebM",           body: "Up to 4K resolution" },
    { tag: "SMART",   title: "SponsorBlock",         body: "Auto-skip sponsors, intros, outros" },
    { tag: "BATCH",   title: "Queue",                body: "Paste many URLs, sequential downloads" },
    { tag: "LOCAL",   title: "History",              body: "Recent downloads, stored locally" },
    { tag: "PRIVACY", title: "No accounts",          body: "Zero auth, zero telemetry, zero cloud" },
  ];

  const colW = (10 - 2 * SP.pageMargin - 0.3) / 3;
  const rowH = 1.4;
  const x0 = SP.pageMargin;
  const y0 = 1.95;

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = x0 + col * (colW + 0.15);
    const y = y0 + row * (rowH + 0.2);

    // Card
    addCard(slide, pres, { x, y, w: colW, h: rowH, theme });

    // Tag pill
    addTagPill(slide, pres, theme, { x: x + 0.25, y: y + 0.25, w: 0.85, label: f.tag });

    // Title
    slide.addText(f.title, {
      x: x + 0.25, y: y + 0.6, w: colW - 0.5, h: 0.35,
      fontSize: TYPE.cardTitle, fontFace: "Arial", color: theme.primary,
      bold: true, align: "left",
    });

    // Body
    slide.addText(f.body, {
      x: x + 0.25, y: y + 0.95, w: colW - 0.5, h: 0.4,
      fontSize: TYPE.body, fontFace: "Arial", color: theme.secondary,
      align: "left", lineSpacingMultiple: 1.3,
    });
  });

  addPageBadge(slide, pres, theme, 7);
  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 7 } };