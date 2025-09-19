#!/usr/bin/env node
const { ESLint } = require("eslint");
const fs = require("fs");
const path = require("path");

(async function main() {
  try {
    const eslint = new ESLint({ ignore: false });

    // Find all JS files that actually exist
    const jsFiles = [];
    const searchPaths = ["netlify/functions", "scripts"];
    
    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        const files = fs.readdirSync(searchPath);
        for (const file of files) {
          if (file.endsWith(".js")) {
            jsFiles.push(path.join(searchPath, file));
          }
        }
      }
    }
    
    if (jsFiles.length === 0) {
      console.log("No JavaScript files found to lint.");
      process.exit(0);
    }

    const results = await eslint.lintFiles(jsFiles);
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
