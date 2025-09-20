#!/usr/bin/env node
const { ESLint } = require("eslint");

(async function main() {
  try {
    const eslint = new ESLint({ ignore: false });

    // lintFiles accepts glob patterns; only lint JS files from src, netlify, and scripts directories
    // This excludes HTML files and JS files from other directories (e.g., node_modules)
    const results = await eslint.lintFiles(["src/**/*.js", "netlify/**/*.js", "scripts/**/*.js"]);
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
