#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_PUBLIC = path.join(ROOT_DIR, 'frontend', 'public');
const EXTRACTED_JSON = path.join(FRONTEND_PUBLIC, 'pdf_text2', 'extracted_questions.json');
const PDF_DIR = path.join(FRONTEND_PUBLIC, 'pdfs');
const OUTPUT_DIR = path.join(FRONTEND_PUBLIC, 'pdf_questions');

function parsePdfPageNumbers(prompt) {
  const matches = prompt.match(/---\s*PAGE\s*(\d+)\s*---/gi);
  if (!matches) {
    return [];
  }
  return matches
    .map((marker) => {
      const match = marker.match(/(\d+)/);
      return match ? Number(match[1]) : NaN;
    })
    .filter((page) => !Number.isNaN(page));
}

function getPdfFileName(sourceFile) {
  return sourceFile.replace(/\.txt$/i, '.pdf');
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function generateSlice(sourcePdfPath, outputPath, pageNumber) {
  const pdfBytes = fs.readFileSync(sourcePdfPath);
  const sourcePdf = await PDFDocument.load(pdfBytes);
  const pageCount = sourcePdf.getPageCount();

  if (pageNumber < 1 || pageNumber > pageCount) {
    throw new Error(`Page number ${pageNumber} is out of range for ${path.basename(sourcePdfPath)} (${pageCount} pages)`);
  }

  const targetPdf = await PDFDocument.create();
  const [copiedPage] = await targetPdf.copyPages(sourcePdf, [pageNumber - 1]);
  targetPdf.addPage(copiedPage);

  const outputBytes = await targetPdf.save();
  fs.writeFileSync(outputPath, outputBytes);
}

async function generateMultiPageSlice(sourcePdfPath, outputPath, pageNumbers) {
  const pdfBytes = fs.readFileSync(sourcePdfPath);
  const sourcePdf = await PDFDocument.load(pdfBytes);
  const pageCount = sourcePdf.getPageCount();

  const invalidPage = pageNumbers.find((page) => page < 1 || page > pageCount);
  if (invalidPage) {
    throw new Error(`Page number ${invalidPage} is out of range for ${path.basename(sourcePdfPath)} (${pageCount} pages)`);
  }

  const targetPdf = await PDFDocument.create();
  const copiedPages = await targetPdf.copyPages(sourcePdf, pageNumbers.map((page) => page - 1));
  copiedPages.forEach((page) => targetPdf.addPage(page));

  const outputBytes = await targetPdf.save();
  fs.writeFileSync(outputPath, outputBytes);
}

async function main() {
  if (!fs.existsSync(EXTRACTED_JSON)) {
    console.error(`Could not find extracted question index at ${EXTRACTED_JSON}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(EXTRACTED_JSON, 'utf-8'));
  const questionEntries = Object.entries(rawData);
  if (questionEntries.length === 0) {
    console.warn('No extracted questions found in JSON.');
    return;
  }

  ensureDirectory(OUTPUT_DIR);

  const generated = [];
  const skipped = [];

  for (const [sourceFile, items] of questionEntries) {
    const pdfFileName = getPdfFileName(sourceFile);
    const sourcePdfPath = path.join(PDF_DIR, pdfFileName);
    if (!fs.existsSync(sourcePdfPath)) {
      console.warn(`Skipping ${sourceFile}: source PDF not found at ${sourcePdfPath}`);
      skipped.push({ sourceFile, reason: 'missing pdf' });
      continue;
    }

    const sourceBase = pdfFileName.replace(/\.pdf$/i, '');
    const outputFolder = path.join(OUTPUT_DIR, sourceBase);
    ensureDirectory(outputFolder);

    for (const rawQuestion of items) {
      const pageNumbers = parsePdfPageNumbers(rawQuestion.prompt);
      if (pageNumbers.length === 0) {
        skipped.push({ sourceFile, questionNumber: rawQuestion.questionNumber, reason: 'missing page marker' });
        continue;
      }

      const sortedPages = Array.from(new Set(pageNumbers)).sort((a, b) => a - b);
      const firstPage = sortedPages[0];
      const lastPage = sortedPages[sortedPages.length - 1];
      const sliceFileName = sortedPages.length === 1
        ? `q${rawQuestion.questionNumber}-page-${firstPage}-${rawQuestion.lineIndex}.pdf`
        : `q${rawQuestion.questionNumber}-pages-${firstPage}-${lastPage}-${rawQuestion.lineIndex}.pdf`;
      const outputPath = path.join(outputFolder, sliceFileName);

      if (fs.existsSync(outputPath)) {
        generated.push({ outputPath, status: 'exists' });
        continue;
      }

      try {
        if (sortedPages.length === 1) {
          await generateSlice(sourcePdfPath, outputPath, firstPage);
        } else {
          await generateMultiPageSlice(sourcePdfPath, outputPath, sortedPages);
        }
        generated.push({ outputPath, status: 'created' });
      } catch (error) {
        console.error(`Failed to generate slice for ${sourceFile} Q${rawQuestion.questionNumber}:`, error.message);
        skipped.push({ sourceFile, questionNumber: rawQuestion.questionNumber, reason: error.message });
      }
    }
  }

  console.log(`\nGenerated ${generated.filter(item => item.status === 'created').length} PDF slices.`);
  console.log(`Skipped ${skipped.length} questions.`);
  if (generated.length > 0) {
    console.log('Generated file examples:');
    generated.slice(0, 5).forEach((item) => console.log(` - [${item.status}] ${item.outputPath}`));
  }

  if (skipped.length > 0) {
    console.log('Skipped entries:');
    skipped.slice(0, 5).forEach((item) => {
      const questionLabel = item.questionNumber ? `Q${item.questionNumber}` : 'unknown';
      console.log(` - ${item.sourceFile} ${questionLabel}: ${item.reason}`);
    });
  }
}

main().catch((error) => {
  console.error('Fatal error generating PDF question slices:', error);
  process.exit(1);
});
