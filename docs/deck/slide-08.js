// Slide 08 — UI: 3D Hero
// Big image on the left, content panel on the right.

const { THEME, EX, TYPE, SP, addHeader, addPageBadge } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  addHeader(slide, pres, theme, {
    eyebrow: "UI · 3D SCENE",
    title: "Hero with animated equalizer",
  });

  // Big screenshot — takes 60% of the slide width
  const imgX = SP.pageMargin;
  const imgY = 1.85;
  const imgW = 5.6;
  const imgH = 3.15;

  // Frame
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: imgX, y: imgY, w: imgW, h: imgH,
    fill: { color: theme.primary }, line: { color: EX.line, width: 1 },
    rectRadius: 0.2,
  });
  // Image
  slide.addImage({
    path: "./imgs/hero.png",
    x: imgX + 0.05, y: imgY + 0.05, w: imgW - 0.1, h: imgH - 0.1,
    sizing: { type: "cover", w: imgW - 0.1, h: imgH - 0.1 },
  });

  // Right panel — title + bullets
  const panelX = imgX + imgW + 0.3;
  const panelW = 10 - SP.pageMargin - panelX;

  // Section title
  slide.addText("Three.js", {
    x: panelX, y: imgY + 0.1, w: panelW, h: 0.4,
    fontSize: TYPE.subtitle, fontFace: "Arial", color: theme.primary,
    bold: true,
  });

  // Sub-line
  slide.addText("64 instanced bars", {
    x: panelX, y: imgY + 0.5, w: panelW, h: 0.3,
    fontSize: TYPE.body, fontFace: "Arial", color: theme.accent, bold: true,
  });

  // Divider
  slide.addShape(pres.shapes.LINE, {
    x: panelX, y: imgY + 0.95, w: panelW, h: 0,
    line: { color: EX.line, width: 1 },
  });

  // Bullets — clean list, no decorative dots
  const bullets = [
    "InstancedMesh = single draw call",
    "Vertex colors with gradient palette",
    "Custom GLSL wave shader",
    "Subtle camera parallax",
    "prefers-reduced-motion respected",
    "Lazy-loaded via dynamic import",
  ];
  bullets.forEach((b, i) => {
    const y = imgY + 1.15 + i * 0.32;
    // Small accent dash instead of circle
    slide.addShape(pres.shapes.RECTANGLE, {
      x: panelX, y: y + 0.1, w: 0.12, h: 0.04,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
    });
    slide.addText(b, {
      x: panelX + 0.25, y: y, w: panelW - 0.25, h: 0.3,
      fontSize: TYPE.body, fontFace: "Arial", color: theme.secondary,
      valign: "top",
    });
  });

  addPageBadge(slide, pres, theme, 8);
  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 8 } };