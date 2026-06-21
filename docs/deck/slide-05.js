// Slide 05 — Tech Stack
// Three layers as horizontal rows. Left column = label, right column = pills.

const { THEME, EX, TYPE, SP, addHeader, addPageBadge } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  addHeader(slide, pres, theme, {
    eyebrow: "TECH STACK",
    title: "Three layers, each picked for a reason",
  });

  const layers = [
    {
      label: "FRONTEND",
      items: [
        { name: "Next.js 16",  desc: "App router · server actions" },
        { name: "React 19",     desc: "Server components · suspense" },
        { name: "Tailwind v4",  desc: "CSS-first design tokens" },
        { name: "Three.js",     desc: "Animated 3D equalizer" },
      ],
    },
    {
      label: "BACKEND",
      items: [
        { name: "API routes",   desc: "/api/info · /api/download" },
        { name: "Zod",          desc: "Request body validation" },
        { name: "child_process",desc: "Spawn yt-dlp subprocess" },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        { name: "yt-dlp",       desc: "1,800+ site extractors" },
        { name: "ffmpeg",       desc: "Audio extract + mp3 encode" },
        { name: "Docker",       desc: "Multi-stage Debian build" },
      ],
    },
  ];

  const rowH = 1.05;
  const y0 = 1.95;
  const labelW = 1.5;
  const pillAreaX = SP.pageMargin + labelW + 0.4;
  const pillAreaW = 10 - 2 * SP.pageMargin - labelW - 0.4;

  layers.forEach((layer, idx) => {
    const y = y0 + idx * (rowH + 0.15);
    const items = layer.items;
    const pillW = (pillAreaW - (items.length - 1) * 0.15) / items.length;

    // Left vertical accent rule
    slide.addShape(pres.shapes.RECTANGLE, {
      x: SP.pageMargin, y: y, w: 0.05, h: rowH,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
    });

    // Layer label (vertical centered)
    slide.addText(layer.label, {
      x: SP.pageMargin + 0.15, y: y, w: labelW, h: rowH,
      fontSize: TYPE.caption, fontFace: "Arial", color: theme.primary,
      bold: true, valign: "middle", charSpacing: 4,
    });

    // Pill items
    items.forEach((it, i) => {
      const px = pillAreaX + i * (pillW + 0.15);

      // Pill bg
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: px, y: y, w: pillW, h: rowH,
        fill: { color: EX.surface },
        line: { color: EX.line, width: 1 },
        rectRadius: 0.12,
      });

      // Name
      slide.addText(it.name, {
        x: px + 0.2, y: y + 0.18, w: pillW - 0.4, h: 0.35,
        fontSize: TYPE.cardTitle, fontFace: "Arial", color: theme.primary,
        bold: true, align: "left",
      });

      // Desc
      slide.addText(it.desc, {
        x: px + 0.2, y: y + 0.55, w: pillW - 0.4, h: 0.4,
        fontSize: TYPE.caption, fontFace: "Arial", color: theme.secondary,
        align: "left", lineSpacingMultiple: 1.2,
      });
    });
  });

  addPageBadge(slide, pres, theme, 5);
  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 5 } };