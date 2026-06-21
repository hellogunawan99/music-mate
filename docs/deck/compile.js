// Compile all slide modules into final PPTX.

const path = require("path");
const pptxgen = require("pptxgenjs");
const { THEME } = require("./tokens.js");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

const SLIDE_COUNT = 11;
for (let i = 1; i <= SLIDE_COUNT; i++) {
  const num = String(i).padStart(2, "0");
  const slideModule = require(`./slide-${num}.js`);
  slideModule.createSlide(pres, THEME);
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