// Compile all slide modules into final PPTX

const path = require("path");
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

// Theme: violet/pink/amber gradient identity, light bg by default.
// Keys are locked to the contract: primary / secondary / accent / light / bg.
const theme = {
  primary:   "09090B", // zinc-950 — dark text + dark slide bg
  secondary: "52525B", // zinc-600 — body / muted text
  accent:    "8B5CF6", // violet-500 — primary brand
  light:     "FBBF24", // amber-400 — secondary brand / highlights
  bg:        "FAFAFA", // zinc-50 — light slide bg
};

const SLIDE_COUNT = 11;
for (let i = 1; i <= SLIDE_COUNT; i++) {
  const num = String(i).padStart(2, "0");
  const slideModule = require(`./slide-${num}.js`);
  slideModule.createSlide(pres, theme);
  console.log(`✓ slide ${num}`);
}

pres
  .writeFile({ fileName: "./output/music-mate.pptx" })
  .then((fn) => {
    console.log(`\n→ wrote ${fn}`);
  })
  .catch((err) => {
    console.error("compile failed:", err);
    process.exit(1);
  });