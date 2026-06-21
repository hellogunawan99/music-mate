// Slide 10 — Deployment
// 3 vertical cards stacked horizontally. Code block in each.

const { THEME, EX, TYPE, SP, addHeader, addPageBadge } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  addHeader(slide, pres, theme, {
    eyebrow: "DEPLOYMENT",
    title: "One Docker image, three commands",
  });

  const steps = [
    { n: "01", title: "Clone", cmd: "git clone https://github.com/hellogunawan99/music-mate.git\ncd music-mate" },
    { n: "02", title: "Build", cmd: "docker build -t music-mate:local ." },
    { n: "03", title: "Run",   cmd: "docker compose up -d\n# → http://localhost:3847" },
  ];

  const colW = (10 - 2 * SP.pageMargin - 0.4) / 3;
  const cardH = 2.6;
  const x0 = SP.pageMargin;
  const y0 = 1.95;

  steps.forEach((s, i) => {
    const x = x0 + i * (colW + 0.2);

    // Frame
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: y0, w: colW, h: cardH,
      fill: { color: EX.surface }, line: { color: EX.line, width: 1 },
      rectRadius: 0.18,
    });

    // Big step number
    slide.addText(s.n, {
      x: x + 0.25, y: y0 + 0.2, w: colW - 0.5, h: 0.55,
      fontSize: 32, fontFace: "Arial", color: theme.accent, bold: true,
    });

    // Title
    slide.addText(s.title, {
      x: x + 0.25, y: y0 + 0.75, w: colW - 0.5, h: 0.4,
      fontSize: TYPE.subtitle, fontFace: "Arial", color: theme.primary,
      bold: true,
    });

    // Code block
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25, y: y0 + 1.25, w: colW - 0.5, h: 1.15,
      fill: { color: theme.primary }, line: { color: theme.primary, width: 0 },
      rectRadius: 0.1,
    });
    slide.addText(s.cmd, {
      x: x + 0.4, y: y0 + 1.35, w: colW - 0.8, h: 0.95,
      fontSize: 9, fontFace: "Courier New", color: "E8E8EC",
      align: "left", valign: "top", lineSpacingMultiple: 1.3,
    });
  });

  // Bottom callout
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: SP.pageMargin, y: 4.7, w: 10 - 2 * SP.pageMargin, h: 0.4,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 },
    rectRadius: 0.1,
  });
  slide.addText("1.03 GB image · yt-dlp + ffmpeg + Node 20 · non-root · healthcheck", {
    x: SP.pageMargin, y: 4.7, w: 10 - 2 * SP.pageMargin, h: 0.4,
    fontSize: TYPE.body, fontFace: "Arial", color: "FFFFFF",
    align: "center", valign: "middle",
  });

  addPageBadge(slide, pres, theme, 10);
  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 10 } };