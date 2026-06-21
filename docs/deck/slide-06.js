// Slide 06 — Architecture (vertical flow)
// One column, 5 steps. Each step has number + title + description.
// Cleaner than a horizontal flow — easier to read at presentation pace.

const { THEME, EX, TYPE, SP, addHeader, addPageBadge } = require("./tokens.js");

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  addHeader(slide, pres, theme, {
    eyebrow: "ARCHITECTURE",
    title: "How a download flows through the system",
  });

  const steps = [
    { n: "1", title: "User submits URL",            body: "React triggers POST /api/download with format options" },
    { n: "2", title: "API spawns yt-dlp",           body: "Subprocess with audio-format=mp3, bitrate=192K" },
    { n: "3", title: "yt-dlp fetches source",       body: "Pulls metadata + audio stream from origin server" },
    { n: "4", title: "ffmpeg post-processes",      body: "Extracts audio, encodes to mp3, embeds metadata" },
    { n: "5", title: "Stream piped back",           body: "Temp file → ReadableStream → browser save dialog" },
  ];

  const rowH = 0.55;
  const y0 = 2.0;
  const numW = 0.55;

  steps.forEach((s, idx) => {
    const y = y0 + idx * (rowH + 0.05);

    // Number circle
    slide.addShape(pres.shapes.OVAL, {
      x: SP.pageMargin, y: y + 0.06, w: numW, h: numW,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
    });
    slide.addText(s.n, {
      x: SP.pageMargin, y: y + 0.06, w: numW, h: numW,
      fontSize: TYPE.cardTitle, fontFace: "Arial", color: "FFFFFF",
      bold: true, align: "center", valign: "middle",
    });

    // Vertical connector line (except after last)
    if (idx < steps.length - 1) {
      slide.addShape(pres.shapes.LINE, {
        x: SP.pageMargin + numW / 2, y: y + numW + 0.06,
        w: 0, h: rowH - numW + 0.05,
        line: { color: EX.lineStrong, width: 1, dashType: "dash" },
      });
    }

    // Title
    slide.addText(s.title, {
      x: SP.pageMargin + numW + 0.3, y: y + 0.05, w: 4.5, h: 0.3,
      fontSize: TYPE.cardTitle, fontFace: "Arial", color: theme.primary,
      bold: true, valign: "top",
    });

    // Body
    slide.addText(s.body, {
      x: SP.pageMargin + numW + 0.3, y: y + 0.32, w: 7.5, h: 0.3,
      fontSize: TYPE.body, fontFace: "Arial", color: theme.secondary,
      valign: "top",
    });
  });

  addPageBadge(slide, pres, theme, 6);
  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 6 } };