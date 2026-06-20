// Slide 05 — Tech Stack

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("TECH STACK", {
    x: 0.5, y: 0.45, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: theme.accent,
    bold: true, charSpacing: 4
  });

  slide.addText("Three layers, each picked for a reason", {
    x: 0.5, y: 0.8, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Arial", color: theme.primary,
    bold: true, align: "left"
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 0.6, h: 0.06,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // Three layered rows: Frontend / Backend / System
  const layers = [
    {
      label: "FRONTEND",
      items: [
        { name: "Next.js 16",     desc: "App router, server actions" },
        { name: "React 19",        desc: "Server components, suspense" },
        { name: "Tailwind v4",     desc: "CSS-first design tokens" },
        { name: "Three.js",        desc: "Animated 3D equalizer" },
      ],
      color: theme.accent,
    },
    {
      label: "BACKEND",
      items: [
        { name: "Next.js API routes", desc: "/api/info, /api/download, /api/health" },
        { name: "Zod",                 desc: "Request body validation" },
        { name: "Node child_process",  desc: "Spawn yt-dlp subprocess" },
      ],
      color: theme.light,
    },
    {
      label: "SYSTEM",
      items: [
        { name: "yt-dlp",         desc: "1,800+ site extractors" },
        { name: "ffmpeg",         desc: "Audio extract + mp3 encode" },
        { name: "Docker",         desc: "Multi-stage Debian build" },
        { name: "GitHub Actions", desc: "Auto-build on push (planned)" },
      ],
      color: theme.accent,
    },
  ];

  const rowH = 1.1;
  const startY = 1.95;

  layers.forEach((layer, idx) => {
    const y = startY + idx * (rowH + 0.1);

    // Label column
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: y, w: 0.08, h: rowH,
      fill: { color: layer.color }, line: { color: layer.color, width: 0 }
    });
    slide.addText(layer.label, {
      x: 0.7, y: y, w: 1.5, h: rowH,
      fontSize: 13, fontFace: "Arial", color: theme.primary,
      bold: true, valign: "middle", charSpacing: 2
    });

    // Items in a row of pills
    const items = layer.items;
    const pillAreaX = 2.3;
    const pillAreaW = 7.2;
    const pillW = (pillAreaW - (items.length - 1) * 0.1) / items.length;

    items.forEach((it, i) => {
      const px = pillAreaX + i * (pillW + 0.1);
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: px, y: y + 0.1, w: pillW, h: rowH - 0.2,
        fill: { color: "FFFFFF" },
        line: { color: "E8E8EC", width: 1 },
        rectRadius: 0.08
      });
      slide.addText(it.name, {
        x: px + 0.1, y: y + 0.2, w: pillW - 0.2, h: 0.35,
        fontSize: 12, fontFace: "Arial", color: theme.primary,
        bold: true, align: "left"
      });
      slide.addText(it.desc, {
        x: px + 0.1, y: y + 0.55, w: pillW - 0.2, h: 0.5,
        fontSize: 9, fontFace: "Arial", color: theme.secondary,
        align: "left", lineSpacingMultiple: 1.2
      });
    });
  });

  // Page badge
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("5", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 5 } };