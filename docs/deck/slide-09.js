// Slide 09 — UI: 3 screens
// Three image cards in a row. Bigger frames, generous gap.

const { THEME, EX, TYPE, SP, addHeader, addPageBadge } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  addHeader(slide, pres, theme, {
    eyebrow: "UI SHOWCASE",
    title: "Three more screens, same polish",
  });

  const cards = [
    { img: "./imgs/ready.png",   label: "Metadata fetched", desc: "Title, uploader, duration, thumbnail — auto-parsed" },
    { img: "./imgs/queue.png",   label: "Batch queue",      desc: "Paste many URLs, sequential downloads with status" },
    { img: "./imgs/history.png", label: "Local history",    desc: "Re-download in one click · stored in browser only" },
  ];

  const colW = (10 - 2 * SP.pageMargin - 0.4) / 3;
  const cardH = 3.0;
  const x0 = SP.pageMargin;
  const y0 = 1.95;

  cards.forEach((c, i) => {
    const x = x0 + i * (colW + 0.2);

    // Frame
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: y0, w: colW, h: cardH,
      fill: { color: EX.surface }, line: { color: EX.line, width: 1 },
      rectRadius: 0.18,
    });

    // Image area
    slide.addImage({
      path: c.img,
      x: x + 0.18, y: y0 + 0.18, w: colW - 0.36, h: 1.6,
      sizing: { type: "cover", w: colW - 0.36, h: 1.6 },
    });

    // Label
    slide.addText(c.label, {
      x: x + 0.25, y: y0 + 1.9, w: colW - 0.5, h: 0.4,
      fontSize: TYPE.cardTitle, fontFace: "Arial", color: theme.primary,
      bold: true,
    });

    // Desc
    slide.addText(c.desc, {
      x: x + 0.25, y: y0 + 2.3, w: colW - 0.5, h: 0.6,
      fontSize: TYPE.body, fontFace: "Arial", color: theme.secondary,
      lineSpacingMultiple: 1.3,
    });
  });

  addPageBadge(slide, pres, theme, 9);
  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 9 } };