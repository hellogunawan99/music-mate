// Slide 11 — Closing / call to action

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  // Decorative gradient bars
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.35, h: 5.625,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.35, y: 0, w: 0.18, h: 5.625,
    fill: { color: theme.light }, line: { color: theme.light, width: 0 }
  });

  // Eyebrow
  slide.addText("THAT'S IT", {
    x: 0.9, y: 1.0, w: 4, h: 0.3,
    fontSize: 12, fontFace: "Arial", color: theme.light,
    bold: true, charSpacing: 4
  });

  // Big title
  slide.addText("Thanks for watching.", {
    x: 0.9, y: 1.4, w: 8.2, h: 1.1,
    fontSize: 64, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "left"
  });

  // Subline
  slide.addText(
    "Music Mate is open source and lives on GitHub.\nStar it, fork it, or just take it for a spin.",
    {
      x: 0.9, y: 2.65, w: 8.2, h: 0.8,
      fontSize: 16, fontFace: "Arial", color: "C9C9D1",
      align: "left", lineSpacingMultiple: 1.3
    }
  );

  // CTA pill — repo link
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.9, y: 3.65, w: 4.4, h: 0.6,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
    rectRadius: 0.3
  });
  slide.addText("github.com/hellogunawan99/music-mate", {
    x: 0.9, y: 3.65, w: 4.4, h: 0.6,
    fontSize: 13, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle"
  });

  // Secondary — local demo URL
  slide.addText("Try locally:  http://192.168.18.16:3847", {
    x: 5.6, y: 3.65, w: 4, h: 0.6,
    fontSize: 13, fontFace: "Arial", color: theme.light,
    align: "left", valign: "middle"
  });

  // Footer
  slide.addShape(pres.shapes.LINE, {
    x: 0.9, y: 4.7, w: 8.2, h: 0,
    line: { color: "3A3A42", width: 1 }
  });
  slide.addText("Built with Next.js 16 · React 19 · yt-dlp · ffmpeg · Three.js", {
    x: 0.9, y: 4.85, w: 8.2, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: "8A8A92",
    align: "left"
  });

  // Page badge
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fill: { color: theme.light }, line: { color: theme.light, width: 0 }
  });
  slide.addText("11", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 10, fontFace: "Arial", color: theme.primary,
    bold: true, align: "center", valign: "middle"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "closing", index: 11 } };