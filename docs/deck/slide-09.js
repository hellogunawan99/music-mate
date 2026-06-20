// Slide 09 — UI showcase #2 (metadata + queue + history)

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("UI SHOWCASE", {
    x: 0.5, y: 0.45, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: theme.accent,
    bold: true, charSpacing: 4
  });

  slide.addText("Three more screens, same polish", {
    x: 0.5, y: 0.8, w: 9, h: 0.7,
    fontSize: 28, fontFace: "Arial", color: theme.primary,
    bold: true, align: "left"
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 0.6, h: 0.06,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // Three small screenshots side by side
  const cards = [
    { img: "./imgs/ready.png",  label: "Metadata fetched",      desc: "Auto-parsed title, uploader, duration, thumbnail" },
    { img: "./imgs/queue.png",  label: "Batch queue",            desc: "Paste many URLs · sequential · status counts" },
    { img: "./imgs/history.png", label: "Local history",         desc: "Re-download in 1 click · stored only in browser" },
  ];

  const cW = 2.95;
  const cH = 2.8;
  const cGap = 0.15;
  const cX0 = 0.5;
  const cY = 1.95;

  cards.forEach((c, i) => {
    const x = cX0 + i * (cW + cGap);

    // Frame
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: cY, w: cW, h: cH,
      fill: { color: "FFFFFF" },
      line: { color: "E8E8EC", width: 1 },
      rectRadius: 0.1
    });
    // Image area
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.15, y: cY + 0.15, w: cW - 0.3, h: 1.65,
      fill: { color: "09090B" },
      line: { color: "09090B", width: 0 }
    });
    slide.addImage({
      path: c.img,
      x: x + 0.15, y: cY + 0.15, w: cW - 0.3, h: 1.65,
      sizing: { type: "cover", w: cW - 0.3, h: 1.65 }
    });
    // Label
    slide.addText(c.label, {
      x: x + 0.2, y: cY + 1.9, w: cW - 0.4, h: 0.35,
      fontSize: 14, fontFace: "Arial", color: theme.primary,
      bold: true, align: "left"
    });
    // Desc
    slide.addText(c.desc, {
      x: x + 0.2, y: cY + 2.25, w: cW - 0.4, h: 0.5,
      fontSize: 10, fontFace: "Arial", color: theme.secondary,
      align: "left", lineSpacingMultiple: 1.3
    });
  });

  // Page badge
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("9", {
    x: 9.3, y: 5.1, w: 0.4, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: "FFFFFF",
    bold: true, align: "center", valign: "middle"
  });

  return slide;
}

module.exports = { createSlide, slideConfig: { type: "content", index: 9 } };