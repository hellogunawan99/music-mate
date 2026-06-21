// Slide 01 — Cover
// Single focal point: massive title. Generous breathing room.
// Dark slide bg, no card chrome — let type do the work.

const { THEME, EX, TYPE, SP, addPageBadge } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  // Single accent bar — vertical, left edge, signals brand
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
  });

  // Tiny brand mark — colored circles evoking the waveform logo
  const markY = 1.5;
  const markHeights = [0.22, 0.42, 0.65, 0.42, 0.22];
  let markX = SP.pageMargin;
  markHeights.forEach((h, i) => {
    const isCenter = i === 2;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: markX, y: markY + (0.65 - h) / 2, w: 0.13, h,
      fill: { color: isCenter ? theme.light : theme.accent },
      line: { color: isCenter ? theme.light : theme.accent, width: 0 },
      rectRadius: 0.05,
    });
    markX += 0.2;
  });

  // Project label (eyebrow)
  slide.addText("PROJECT SHOWCASE", {
    x: SP.pageMargin, y: 2.3, w: 9, h: 0.3,
    fontSize: TYPE.caption, fontFace: "Arial",
    color: theme.light, bold: true, charSpacing: 6,
  });

  // Massive title
  slide.addText("Music Mate", {
    x: SP.pageMargin, y: 2.6, w: 9, h: 1.3,
    fontSize: TYPE.display, fontFace: "Arial",
    color: "FFFFFF", bold: true,
  });

  // Subtitle
  slide.addText("Self-hosted music & video downloader", {
    x: SP.pageMargin, y: 4.0, w: 9, h: 0.5,
    fontSize: TYPE.subtitle, fontFace: "Arial",
    color: theme.light,
  });

  // Footer rule + meta
  slide.addShape(pres.shapes.LINE, {
    x: SP.pageMargin, y: 4.9, w: 9, h: 0,
    line: { color: "2A2A33", width: 1 },
  });
  slide.addText("github.com/hellogunawan99/music-mate", {
    x: SP.pageMargin, y: 5.0, w: 5, h: 0.3,
    fontSize: TYPE.body, fontFace: "Arial", color: EX.surface,
  });
  slide.addText("June 2026", {
    x: 5.5, y: 5.0, w: 4, h: 0.3,
    fontSize: TYPE.body, fontFace: "Arial", color: EX.inkSubtle,
    align: "right",
  });

  // No page badge on cover
  return slide;
}

module.exports = { createSlide, slideConfig: { type: "cover", index: 1 } };