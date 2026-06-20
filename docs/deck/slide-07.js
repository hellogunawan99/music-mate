// Slide 07 — Features (grid)

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("FEATURES", {
    x: 0.5, y: 0.45, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: theme.accent,
    bold: true, charSpacing: 4
  });

  slide.addText("Everything you'd want, nothing you don't", {
    x: 0.5, y: 0.8, w: 9, h: 0.7,
    fontSize: 28, fontFace: "Arial", color: theme.primary,
    bold: true, align: "left"
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 0.6, h: 0.06,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  const features = [
    { tag: "AUDIO",  title: "MP3 / M4A / Opus",     desc: "Bitrate control: 128 / 192 / 320 kbps" },
    { tag: "VIDEO",  title: "MP4 / WebM",          desc: "Up to 4K resolution (720p / 1080p / 4K)" },
    { tag: "SMART",  title: "SponsorBlock",        desc: "Auto-skip sponsors, intros, outros, self-promo" },
    { tag: "BATCH",  title: "Queue",                desc: "Paste a list of URLs — sequential batch download" },
    { tag: "LOCAL",  title: "History",              desc: "Recent downloads saved locally in your browser" },
    { tag: "PRIVACY",title: "No accounts",          desc: "Zero auth, zero telemetry, zero cloud storage" },
  ];

  const fW = 2.95;
  const fGap = 0.15;
  const fX0 = 0.5;
  const fY = 1.95;
  const fH = 1.45;

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = fX0 + col * (fW + fGap);
    const y = fY + row * (fH + 0.15);

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: y, w: fW, h: fH,
      fill: { color: "FFFFFF" },
      line: { color: "E8E8EC", width: 1 },
      rectRadius: 0.1
    });
    // accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: y, w: fW, h: 0.06,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
    });
    // Tag pill
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25, y: y + 0.25, w: 0.7, h: 0.25,
      fill: { color: theme.primary }, line: { color: theme.primary, width: 0 },
      rectRadius: 0.05
    });
    slide.addText(f.tag, {
      x: x + 0.25, y: y + 0.25, w: 0.7, h: 0.25,
      fontSize: 8, fontFace: "Arial", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", charSpacing: 2
    });
    // Title
    slide.addText(f.title, {
      x: x + 0.25, y: y + 0.6, w: fW - 0.5, h: 0.35,
      fontSize: 16, fontFace: "Arial", color: theme.primary,
      bold: true, align: "left"
    });
    // Desc
    slide.addText(f.desc, {
      x: x + 0.25, y: y + 0.95, w: fW - 0.5, h: 0.45,
      fontSize: 11, fontFace: "Arial", color: theme.secondary,
      align: "left", lineSpacingMultiple: 1.3
    });
  });

  // Page badge
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("7", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 7 } };