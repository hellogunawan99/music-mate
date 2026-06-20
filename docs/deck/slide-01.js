// Slide 01 — Cover
// Dark, bold, gradient accent. No page badge (cover rule).

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  // Decorative gradient bars (top-left)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.35, h: 5.625,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.35, y: 0, w: 0.18, h: 5.625,
    fill: { color: theme.light }, line: { color: theme.light, width: 0 }
  });

  // Eyebrow tag
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.9, y: 1.05, w: 1.6, h: 0.32,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("PROJECT SHOWCASE", {
    x: 0.9, y: 1.05, w: 1.6, h: 0.32,
    fontSize: 10, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle",
    charSpacing: 4
  });

  // Main title
  slide.addText("Music Mate", {
    x: 0.9, y: 1.55, w: 8.2, h: 1.2,
    fontSize: 80, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "left"
  });

  // Subtitle
  slide.addText("Self-hosted music & video downloader", {
    x: 0.9, y: 2.85, w: 8.2, h: 0.6,
    fontSize: 26, fontFace: "Arial", color: theme.light,
    align: "left"
  });

  // Description
  slide.addText(
    "Paste a link from YouTube, Instagram, TikTok, SoundCloud, X, or 1,800+ other sites.\nNo accounts. No tracking. Runs on your machine.",
    {
      x: 0.9, y: 3.55, w: 8.2, h: 0.8,
      fontSize: 14, fontFace: "Arial", color: "C9C9D1",
      align: "left", lineSpacingMultiple: 1.3
    }
  );

  // Footer line — author + repo
  slide.addShape(pres.shapes.LINE, {
    x: 0.9, y: 4.85, w: 8.2, h: 0,
    line: { color: "3A3A42", width: 1 }
  });
  slide.addText("github.com/hellogunawan99/music-mate", {
    x: 0.9, y: 4.95, w: 5, h: 0.3,
    fontSize: 12, fontFace: "Arial", color: theme.light,
    align: "left"
  });
  slide.addText("Built June 2026", {
    x: 4.9, y: 4.95, w: 4.2, h: 0.3,
    fontSize: 12, fontFace: "Arial", color: "8A8A92",
    align: "right"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "cover", index: 1 } };