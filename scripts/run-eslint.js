#!/usr/bin/env node
const { ESLint } = require("eslint");

(async function main() {
  try {
    const eslint = new ESLint({ ignore: false });

    // lintFiles accepts glob patterns; include JS files from src, netlify, and scripts directories
    const results = await eslint.lintFiles([
      "src/**/*.js",
      "netlify/**/*.js",
      "scripts/**/*.js",
      "src/**/*.html",
      "netlify/**/*.html",
      "scripts/**/*.html"
    ]);
    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);
    console.log(resultText);

    const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (err) {
    console.error("ESLint runner error:", err);
    process.exit(2);
  }
})();
