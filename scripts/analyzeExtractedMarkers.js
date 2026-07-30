const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'frontend', 'public', 'pdf_text2', 'extracted_questions.json');
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
let total = 0;
let multi = 0;
let noMarker = 0;
const pages = new Map();
for (const [sourceFile, items] of Object.entries(raw)) {
  for (const item of items) {
    total++;
    const matches = item.prompt.match(/---\s*PAGE\s*\d+\s*---/gi) || [];
    if (matches.length === 0) noMarker++;
    if (matches.length > 1) {
      multi++;
      console.log('MULTI', sourceFile, item.questionNumber, item.lineIndex, matches.join(' | '));
    }
    const nums = matches.map(m => Number(m.replace(/[^0-9]/g, '')));
    if (nums.length > 0) {
      const key = `${sourceFile} ${item.questionNumber}`;
      pages.set(key, nums);
    }
  }
}
console.log('total', total, 'multi', multi, 'noMarker', noMarker);
for (const [key, nums] of pages) {
  if (nums.length > 1) {
    console.log('PAGE-SPAN', key, nums);
  }
}
