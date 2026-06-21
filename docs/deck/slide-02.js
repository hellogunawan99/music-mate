// Slide 02 — Agenda
// Vertical list with generous breathing room. One accent per item.

const { THEME, EX, TYPE, SP, addHeader, addPageBadge } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  addHeader(slide, pres, theme, {
    eyebrow: "AGENDA",
    title: "What we'll cover",
  });

  const items = [
    { n: "01", title: "The problem",         desc: "Why most downloaders fall short" },
    { n: "02", title: "The solution",         desc: "Music Mate's approach" },
    { n: "03", title: "Tech stack",           desc: "Next.js · yt-dlp · ffmpeg · Three.js" },
    { n: "04", title: "Architecture",         desc: "How the pieces fit together" },
    { n: "05", title: "Features",             desc: "MP3/MP4, SponsorBlock, queue, history" },
    { n: "06", title: "UI & 3D scene",        desc: "Design system + animated equalizer" },
    { n: "07", title: "Deployment",           desc: "Docker + GitHub for home-lab" },
    { n: "08", title: "Roadmap",              desc: "What's next for v2" },
  ];

  // 2 columns × 4 rows, generous gaps
  const colW = 4.25;
  const rowH = 0.65;
  const x0 = SP.pageMargin;
  const y0 = 1.95;

  items.forEach((it, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = x0 + col * (colW + 0.4);
    const y = y0 + row * (rowH + 0.1);

    slide.addText(it.n, {
      x, y, w: 0.55, h: rowH,
      fontSize: 20, fontFace: "Arial", color: theme.accent,
      bold: true, valign: "middle",
    });
    slide.addText(it.title, {
      x: x + 0.55, y: y, w: colW - 0.55, h: 0.32,
      fontSize: TYPE.cardTitle, fontFace: "Arial", color: theme.primary,
      bold: true, valign: "top",
    });
    slide.addText(it.desc, {
      x: x + 0.55, y: y + 0.32, w: colW - 0.55, h: 0.3,
      fontSize: TYPE.body, fontFace: "Arial", color: theme.secondary,
      valign: "top",
    });
  });

  addPageBadge(slide, pres, theme, 2);
  return slide;
}

module.exports = { createSlide, slideConfig: { type: "toc", index: 2 } };