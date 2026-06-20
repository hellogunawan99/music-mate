// Slide 02 — Agenda / Table of Contents

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Title
  slide.addText("Agenda", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 40, fontFace: "Arial", color: theme.primary,
    bold: true, align: "left"
  });

  // Subtitle
  slide.addText("What we'll cover in the next 10 slides", {
    x: 0.5, y: 1.1, w: 9, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: theme.secondary,
    align: "left"
  });

  // Accent divider
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 0.6, h: 0.06,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // Two-column TOC items
  const items = [
    { n: "01", title: "The problem",       desc: "Why most downloaders fall short" },
    { n: "02", title: "The solution",      desc: "Music Mate's approach" },
    { n: "03", title: "Tech stack",        desc: "Next.js, yt-dlp, ffmpeg, Three.js" },
    { n: "04", title: "Architecture",      desc: "How the pieces fit together" },
    { n: "05", title: "Features",          desc: "MP3/MP4, SponsorBlock, queue, history" },
    { n: "06", title: "UI & 3D scene",     desc: "Design system + animated equalizer" },
    { n: "07", title: "Deployment",        desc: "Docker + GitHub for home-lab" },
    { n: "08", title: "Roadmap",           desc: "What's next for v2" },
  ];

  const startY = 2.0;
  const rowH = 0.65;
  const colW = 4.4;

  items.forEach((it, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.5 + col * (colW + 0.2);
    const y = startY + row * rowH;

    // Number badge
    slide.addText(it.n, {
      x: x, y: y, w: 0.55, h: 0.5,
      fontSize: 22, fontFace: "Arial", color: theme.accent,
      bold: true, align: "left", valign: "top"
    });
    // Title
    slide.addText(it.title, {
      x: x + 0.6, y: y - 0.02, w: colW - 0.6, h: 0.3,
      fontSize: 15, fontFace: "Arial", color: theme.primary,
      bold: true, align: "left"
    });
    // Desc
    slide.addText(it.desc, {
      x: x + 0.6, y: y + 0.28, w: colW - 0.6, h: 0.25,
      fontSize: 11, fontFace: "Arial", color: theme.secondary,
      align: "left"
    });
  });

  // Page badge
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("2", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "toc", index: 2 } };