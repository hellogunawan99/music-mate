// Slide 03 — The Problem
// 3 cards in a row. Same dimensions, same inner padding, same hierarchy.

const { THEME, EX, TYPE, SP, addHeader, addPageBadge, addCard } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  addHeader(slide, pres, theme, {
    eyebrow: "THE PROBLEM",
    title: "Why most music downloaders fall short",
  });

  const cards = [
    {
      n: "01",
      title: "Clouds everywhere",
      body: "SaaS downloaders hold your files on their servers, throttle free tiers, and get DMCA'd into oblivion. Your downloads aren't yours.",
    },
    {
      n: "02",
      title: "Native apps don't work on mobile",
      body: "yt-dlp is pure Python. Bundling it in an APK costs 150 MB and breaks every update. The iOS App Store rejects these apps outright.",
    },
    {
      n: "03",
      title: "Web apps are slow and ugly",
      body: "Public downloaders are plastered with ads, pop-ups, and 'verify you're human' walls. The good ones die when their hosting bill comes due.",
    },
  ];

  // Equal-width cards: (10 - 2*0.6 - 2*0.3) / 3 = 2.73
  const cardW = 2.73;
  const cardH = 3.0;
  const x0 = SP.pageMargin;
  const y0 = 1.95;

  cards.forEach((c, i) => {
    const x = x0 + i * (cardW + 0.3);

    // Card surface
    addCard(slide, pres, {
      x, y: y0, w: cardW, h: cardH, theme, accent: true,
    });

    // Big number (visual focal)
    slide.addText(c.n, {
      x: x + 0.3, y: y0 + 0.4, w: cardW - 0.6, h: 0.7,
      fontSize: 42, fontFace: "Arial", color: theme.accent, bold: true,
      align: "left",
    });

    // Title
    slide.addText(c.title, {
      x: x + 0.3, y: y0 + 1.25, w: cardW - 0.6, h: 0.6,
      fontSize: TYPE.cardTitle, fontFace: "Arial", color: theme.primary,
      bold: true, align: "left",
    });

    // Body
    slide.addText(c.body, {
      x: x + 0.3, y: y0 + 1.85, w: cardW - 0.6, h: 1.0,
      fontSize: TYPE.body, fontFace: "Arial", color: theme.secondary,
      align: "left", lineSpacingMultiple: 1.4,
    });
  });

  addPageBadge(slide, pres, theme, 3);
  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 3 } };