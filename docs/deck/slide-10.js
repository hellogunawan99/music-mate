// Slide 10 — Deployment

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("DEPLOYMENT", {
    x: 0.5, y: 0.45, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: theme.accent,
    bold: true, charSpacing: 4
  });

  slide.addText("One Docker image, three commands", {
    x: 0.5, y: 0.8, w: 9, h: 0.7,
    fontSize: 28, fontFace: "Arial", color: theme.primary,
    bold: true, align: "left"
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 0.6, h: 0.06,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // Three command cards
  const steps = [
    { n: "01", title: "Clone",   cmd: "git clone https://github.com/hellogunawan99/music-mate.git\ncd music-mate" },
    { n: "02", title: "Build",   cmd: "docker build -t music-mate:local ." },
    { n: "03", title: "Run",     cmd: "docker compose up -d\n# → http://localhost:3847" },
  ];

  const sW = 2.95;
  const sGap = 0.15;
  const sX0 = 0.5;
  const sY = 1.95;
  const sH = 2.5;

  steps.forEach((s, i) => {
    const x = sX0 + i * (sW + sGap);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: sY, w: sW, h: sH,
      fill: { color: "FFFFFF" },
      line: { color: "E8E8EC", width: 1 },
      rectRadius: 0.1
    });
    // Number
    slide.addText(s.n, {
      x: x + 0.25, y: sY + 0.2, w: 1, h: 0.5,
      fontSize: 26, fontFace: "Arial", color: theme.accent, bold: true
    });
    // Title
    slide.addText(s.title, {
      x: x + 0.25, y: sY + 0.7, w: sW - 0.5, h: 0.4,
      fontSize: 18, fontFace: "Arial", color: theme.primary, bold: true
    });
    // Code block
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25, y: sY + 1.2, w: sW - 0.5, h: 1.15,
      fill: { color: "0F0F12" }, line: { color: "0F0F12", width: 0 },
      rectRadius: 0.06
    });
    slide.addText(s.cmd, {
      x: x + 0.4, y: sY + 1.3, w: sW - 0.8, h: 1.0,
      fontSize: 10, fontFace: "Courier New", color: "E8E8EC",
      align: "left", lineSpacingMultiple: 1.3
    });
  });

  // Bottom callout — what you get
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 4.55, w: 9.0, h: 0.5,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 },
    rectRadius: 0.08
  });
  slide.addText(
    "1.03GB image · Node 20 + yt-dlp + ffmpeg + healthcheck + non-root user · production-ready",
    {
      x: 0.7, y: 4.55, w: 8.6, h: 0.5,
      fontSize: 11, fontFace: "Arial", color: "FFFFFF",
      align: "left", valign: "middle"
    }
  );

  // Page badge
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("10", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 10, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 10 } };