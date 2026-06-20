// Slide 06 — Architecture (data flow diagram)

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("ARCHITECTURE", {
    x: 0.5, y: 0.45, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: theme.accent,
    bold: true, charSpacing: 4
  });

  slide.addText("How a download request flows through the system", {
    x: 0.5, y: 0.8, w: 9, h: 0.7,
    fontSize: 26, fontFace: "Arial", color: theme.primary,
    bold: true, align: "left"
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 0.6, h: 0.06,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // Flow diagram — 5 boxes connected by arrows
  const boxes = [
    { label: "Browser",  sub: "React UI",                       color: theme.accent },
    { label: "Next.js",  sub: "API route",                       color: theme.accent },
    { label: "yt-dlp",   sub: "child_process",                   color: theme.light },
    { label: "ffmpeg",   sub: "encode + embed",                  color: theme.light },
    { label: "Temp file", sub: "ReadableStream",                 color: theme.accent },
  ];

  const boxW = 1.55;
  const boxH = 0.95;
  const arrowW = 0.35;
  const totalW = boxes.length * boxW + (boxes.length - 1) * arrowW;
  const startX = (10 - totalW) / 2;
  const boxY = 2.05;

  boxes.forEach((b, i) => {
    const x = startX + i * (boxW + arrowW);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: boxY, w: boxW, h: boxH,
      fill: { color: "FFFFFF" },
      line: { color: b.color, width: 2 },
      rectRadius: 0.08
    });
    slide.addText(b.label, {
      x: x, y: boxY + 0.15, w: boxW, h: 0.4,
      fontSize: 13, fontFace: "Arial", color: theme.primary,
      bold: true, align: "center"
    });
    slide.addText(b.sub, {
      x: x, y: boxY + 0.5, w: boxW, h: 0.35,
      fontSize: 9, fontFace: "Arial", color: theme.secondary,
      align: "center", italic: true
    });

    // Arrow between boxes (except after the last)
    if (i < boxes.length - 1) {
      const ax = x + boxW + 0.05;
      const ay = boxY + boxH / 2;
      slide.addShape(pres.shapes.RIGHT_TRIANGLE, {
        x: ax + 0.15, y: ay - 0.08, w: 0.16, h: 0.16,
        fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
        rotate: 90
      });
      slide.addShape(pres.shapes.LINE, {
        x: ax, y: ay, w: 0.2, h: 0,
        line: { color: theme.accent, width: 2 }
      });
    }
  });

  // Below: numbered callouts for the 5 steps
  const steps = [
    { n: "1", text: "User pastes URL → React triggers POST /api/download" },
    { n: "2", text: "API route spawns yt-dlp subprocess with audio-format=mp3" },
    { n: "3", text: "yt-dlp fetches metadata + audio stream from source" },
    { n: "4", text: "ffmpeg post-processes: extract audio → encode mp3 @ 192kbps" },
    { n: "5", text: "Temp file piped back as ReadableStream → browser save dialog" },
  ];

  const stepY = 3.3;
  const stepH = 0.4;
  steps.forEach((s, i) => {
    const y = stepY + i * stepH;
    // number bubble
    slide.addShape(pres.shapes.OVAL, {
      x: 0.5, y: y + 0.04, w: 0.32, h: 0.32,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
    });
    slide.addText(s.n, {
      x: 0.5, y: y + 0.04, w: 0.32, h: 0.32,
      fontSize: 11, fontFace: "Arial", color: "FFFFFF",
      bold: true, align: "center", valign: "middle"
    });
    slide.addText(s.text, {
      x: 0.95, y: y, w: 8.55, h: stepH,
      fontSize: 11, fontFace: "Arial", color: theme.secondary,
      valign: "middle"
    });
  });

  // Page badge
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("6", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 6 } };