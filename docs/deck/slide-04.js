// Slide 04 — The Solution (Music Mate in a nutshell)

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Eyebrow
  slide.addText("THE SOLUTION", {
    x: 0.5, y: 0.45, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: theme.accent,
    bold: true, charSpacing: 4
  });

  // Title
  slide.addText("Music Mate, in one sentence", {
    x: 0.5, y: 0.8, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Arial", color: theme.primary,
    bold: true, align: "left"
  });

  // Hero quote / one-liner
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.65, w: 9.0, h: 1.0,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 },
    rectRadius: 0.1
  });
  slide.addText(
    "A self-hosted web app that streams audio & video from 1,800+ sites straight to your machine — no accounts, no cloud, no friction.",
    {
      x: 0.7, y: 1.75, w: 8.6, h: 0.8,
      fontSize: 16, fontFace: "Arial", color: "FFFFFF",
      italic: true, align: "left", lineSpacingMultiple: 1.3
    }
  );

  // Four-pillar grid
  const pillars = [
    { icon: "🔒", title: "Self-hosted", body: "Runs on your hardware. Your data never leaves." },
    { icon: "⚡", title: "Zero friction", body: "Paste link → click. No signups. No captchas." },
    { icon: "🎯", title: "All formats", body: "MP3 / M4A / Opus audio. MP4 / WebM up to 4K video." },
    { icon: "🧠", title: "SponsorBlock", body: "Auto-skip sponsors, intros, outros on YouTube." },
  ];

  const pW = 2.15;
  const pGap = 0.15;
  const pX0 = 0.5;
  const pY = 2.95;
  const pH = 1.95;

  pillars.forEach((p, i) => {
    const x = pX0 + i * (pW + pGap);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: pY, w: pW, h: pH,
      fill: { color: "FFFFFF" },
      line: { color: "E8E8EC", width: 1 },
      rectRadius: 0.1
    });
    // Use a colored dot as icon stand-in (no emoji rendering issues)
    slide.addShape(pres.shapes.OVAL, {
      x: x + 0.25, y: pY + 0.25, w: 0.45, h: 0.45,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
    });
    slide.addText(p.title, {
      x: x + 0.25, y: pY + 0.85, w: pW - 0.5, h: 0.35,
      fontSize: 14, fontFace: "Arial", color: theme.primary,
      bold: true, align: "left"
    });
    slide.addText(p.body, {
      x: x + 0.25, y: pY + 1.2, w: pW - 0.5, h: 0.7,
      fontSize: 11, fontFace: "Arial", color: theme.secondary,
      align: "left", lineSpacingMultiple: 1.3
    });
  });

  // Page badge
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("4", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 4 } };