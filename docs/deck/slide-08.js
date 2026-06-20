// Slide 08 — UI showcase (hero with 3D equalizer)

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("UI & 3D SCENE", {
    x: 0.5, y: 0.45, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: theme.accent,
    bold: true, charSpacing: 4
  });

  slide.addText("Hero with animated equalizer", {
    x: 0.5, y: 0.8, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Arial", color: theme.primary,
    bold: true, align: "left"
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 0.6, h: 0.06,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // Big screenshot — full bleed
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.85, w: 6.5, h: 3.1,
    fill: { color: "09090B" },
    line: { color: "E8E8EC", width: 1 },
    rectRadius: 0.1
  });
  slide.addImage({
    path: "./imgs/hero.png",
    x: 0.55, y: 1.9, w: 6.4, h: 3.0,
    sizing: { type: "cover", w: 6.4, h: 3.0 }
  });

  // Right column — three.js detail
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7.2, y: 1.85, w: 2.3, h: 3.1,
    fill: { color: "FFFFFF" },
    line: { color: "E8E8EC", width: 1 },
    rectRadius: 0.1
  });
  slide.addText("Three.js", {
    x: 7.4, y: 2.0, w: 2.0, h: 0.4,
    fontSize: 16, fontFace: "Arial", color: theme.primary,
    bold: true
  });
  slide.addText("64 instanced bars", {
    x: 7.4, y: 2.4, w: 2.0, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: theme.accent, bold: true
  });
  // Detail bullets
  const bullets = [
    "InstancedMesh = 1 draw call",
    "Vertex colors w/ gradient",
    "Wave shader background",
    "Camera parallax sway",
    "prefers-reduced-motion respected",
    "Lazy-loaded (main bundle stays light)",
  ];
  bullets.forEach((b, i) => {
    const y = 2.85 + i * 0.32;
    slide.addShape(pres.shapes.OVAL, {
      x: 7.4, y: y + 0.07, w: 0.1, h: 0.1,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
    });
    slide.addText(b, {
      x: 7.6, y: y, w: 1.85, h: 0.25,
      fontSize: 10, fontFace: "Arial", color: theme.secondary
    });
  });

  // Page badge
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("8", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 8 } };