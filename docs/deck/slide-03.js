// Slide 03 — The Problem

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Eyebrow
  slide.addText("THE PROBLEM", {
    x: 0.5, y: 0.45, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: theme.accent,
    bold: true, charSpacing: 4
  });

  // Title
  slide.addText("Why most music downloaders fall short", {
    x: 0.5, y: 0.8, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Arial", color: theme.primary,
    bold: true, align: "left"
  });

  // Accent underline
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 0.6, h: 0.06,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // Three pain-point cards
  const cards = [
    {
      n: "01",
      title: "Clouds everywhere",
      body: "SaaS downloaders hold your files on their servers, throttle free tiers, and get DMCA'd into oblivion. Your downloads aren't yours.",
    },
    {
      n: "02",
      title: "Native apps don't work on mobile",
      body: "yt-dlp is pure Python. Bundling a Python runtime in an APK costs 150MB and breaks every yt-dlp update. iOS App Store rejects them outright.",
    },
    {
      n: "03",
      title: "Web apps are slow & ugly",
      body: "Public web downloaders are plastered with ads, pop-ups, and 'verify you're human' walls. The good ones die when their hosting bill comes due.",
    },
  ];

  const cardW = 2.95;
  const gap = 0.15;
  const cardX0 = 0.5;
  const cardY = 1.95;
  const cardH = 3.0;

  cards.forEach((c, i) => {
    const x = cardX0 + i * (cardW + gap);
    // Card background
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: cardY, w: cardW, h: cardH,
      fill: { color: "FFFFFF" },
      line: { color: "E8E8EC", width: 1 },
      rectRadius: 0.12
    });
    // Top accent strip
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: cardY, w: cardW, h: 0.08,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
    });
    // Number
    slide.addText(c.n, {
      x: x + 0.3, y: cardY + 0.3, w: 1.0, h: 0.6,
      fontSize: 36, fontFace: "Arial", color: theme.accent,
      bold: true, align: "left"
    });
    // Title
    slide.addText(c.title, {
      x: x + 0.3, y: cardY + 1.05, w: cardW - 0.6, h: 0.55,
      fontSize: 18, fontFace: "Arial", color: theme.primary,
      bold: true, align: "left"
    });
    // Body
    slide.addText(c.body, {
      x: x + 0.3, y: cardY + 1.65, w: cardW - 0.6, h: 1.25,
      fontSize: 12, fontFace: "Arial", color: theme.secondary,
      align: "left", lineSpacingMultiple: 1.3
    });
  });

  // Page badge
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("3", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 3 } };