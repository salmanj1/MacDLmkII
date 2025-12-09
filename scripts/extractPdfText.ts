import fs from 'fs/promises';
import path from 'path';
import {
  getDocument,
  GlobalWorkerOptions
} from 'pdfjs-dist/legacy/build/pdf.mjs';

type PdfJob = {
  filename: string;
  output: string;
};

const docsDir = path.resolve(process.cwd(), 'docs');
const jobs: PdfJob[] = [
  {
    filename: "DL4 MkII Owner's Manual - English .pdf",
    output: 'manual.extracted.txt'
  },
  {
    filename: 'DL4 MkII Cheat Sheet - English .pdf',
    output: 'cheatsheet.extracted.txt'
  }
];

GlobalWorkerOptions.workerSrc = new URL(
  '../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const extractPdf = async ({ filename, output }: PdfJob) => {
  const inputPath = path.join(docsDir, filename);
  const outputPath = path.join(docsDir, output);
  const fileBuffer = await fs.readFile(inputPath);
  const data = new Uint8Array(fileBuffer);
  const loadingTask = getDocument({ data, isEvalSupported: false });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push(`=== PAGE ${pageIndex} ===\n\n${text}`);
  }

  const combined = pages.join('\n\n');
  await fs.writeFile(outputPath, combined, 'utf8');
  console.log(`Extracted ${pdf.numPages} pages from ${filename} -> ${output}`);
};

(async () => {
  for (const job of jobs) {
    try {
      await extractPdf(job);
    } catch (error) {
      console.error(`Failed to extract ${job.filename}:`, error);
      process.exitCode = 1;
    }
  }
})();
