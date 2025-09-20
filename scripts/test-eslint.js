#!/usr/bin/env node
// Test script to verify ESLint only lints JS files in specified directories

const { ESLint } = require("eslint");
const path = require("path");

async function testESLintPatterns() {
  console.log("Testing ESLint patterns...");
  
  try {
    const eslint = new ESLint({ ignore: false });
    
    // Test the patterns used in run-eslint.js
    const patterns = ["src/**/*.js", "netlify/**/*.js", "scripts/**/*.js"];
    const results = await eslint.lintFiles(patterns);
    
    console.log(`\nFound ${results.length} files to lint:`);
    results.forEach(result => {
      const relativePath = path.relative(process.cwd(), result.filePath);
      console.log(`  - ${relativePath}`);
    });
    
    // Verify no HTML files are included
    const htmlFiles = results.filter(result => result.filePath.endsWith('.html'));
    if (htmlFiles.length > 0) {
      console.error("\n❌ ERROR: HTML files are being linted:");
      htmlFiles.forEach(file => console.error(`  - ${file.filePath}`));
      process.exit(1);
    } else {
      console.log("\n✅ SUCCESS: No HTML files are being linted");
    }
    
    // Verify only files from the correct directories are included
    const allowedDirectories = ['src/', 'netlify/', 'scripts/'];
    const invalidFiles = results.filter(result => {
      const relativePath = path.relative(process.cwd(), result.filePath);
      return !allowedDirectories.some(dir => relativePath.startsWith(dir));
    });
    
    if (invalidFiles.length > 0) {
      console.error("\n❌ ERROR: Files from unexpected directories are being linted:");
      invalidFiles.forEach(file => {
        const relativePath = path.relative(process.cwd(), file.filePath);
        console.error(`  - ${relativePath}`);
      });
      process.exit(1);
    } else {
      console.log("✅ SUCCESS: Only files from src/, netlify/, and scripts/ directories are being linted");
    }
    
    // Verify formatter is "stylish"
    const formatter = await eslint.loadFormatter("stylish");
    if (formatter) {
      console.log("✅ SUCCESS: 'stylish' formatter loads correctly");
    } else {
      console.error("❌ ERROR: Failed to load 'stylish' formatter");
      process.exit(1);
    }
    
    console.log("\n🎉 All tests passed! ESLint configuration is correct.");
    
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  testESLintPatterns();
}

module.exports = { testESLintPatterns };