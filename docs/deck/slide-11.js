// Slide 11 — Closing
// Mirror of the cover for visual bookend. Big title, minimal chrome.

const { THEME, EX, TYPE, SP, addPageBadge } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  // Single accent bar — same as cover
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
  });

  // Tiny brand mark (same as cover)
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

  slide.addText("THAT'S IT", {
    x: SP.pageMargin, y: 2.3, w: 9, h: 0.3,
    fontSize: TYPE.caption, fontFace: "Arial",
    color: theme.light, bold: true, charSpacing: 6,
  });

  slide.addText("Thanks for watching.", {
    x: SP.pageMargin, y: 2.6, w: 9, h: 1.3,
    fontSize: TYPE.display, fontFace: "Arial",
    color: "FFFFFF", bold: true,
  });

  slide.addText("Music Mate is open source. Star it, fork it, or just take it for a spin.", {
    x: SP.pageMargin, y: 4.0, w: 9, h: 0.5,
    fontSize: TYPE.subtitle, fontFace: "Arial",
    color: theme.light,
  });

  // CTA pill
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: SP.pageMargin, y: 4.65, w: 5.0, h: 0.5,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
    rectRadius: 0.25,
  });
  slide.addText("github.com/hellogunawan99/music-mate", {
    x: SP.pageMargin, y: 4.65, w: 5.0, h: 0.5,
    fontSize: TYPE.cardTitle, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle",
  });

  // Local demo URL (right of CTA)
  slide.addText("Try locally: http://192.168.18.16:3847", {
    x: 6.2, y: 4.65, w: 3.5, h: 0.5,
    fontSize: TYPE.body, fontFace: "Arial", color: EX.surfaceAlt,
    valign: "middle",
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "closing", index: 11 } };