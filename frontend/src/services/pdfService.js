import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker via Vite static asset URL
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit per specification

/**
 * Validates resume file format and maximum 5MB size limit.
 * @param {File} file
 * @throws {Error} with friendly user-facing error message
 */
export function validateResumeDocument(file) {
  if (!file) {
    throw new Error('Please select a file to upload.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['pdf', 'txt'];
  const isPdf = file.type === 'application/pdf' || ext === 'pdf';
  const isText = file.type === 'text/plain' || ext === 'txt';

  if (!isPdf && !isText) {
    if (ext === 'doc' || ext === 'docx') {
      throw new Error('Word documents (.doc/.docx) require conversion. Please export or save your resume as a PDF file.');
    }
    throw new Error('Unsupported file format. Please upload a PDF document (.pdf).');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File is too large (${sizeMb} MB). The maximum allowed file size is 5MB.`);
  }

  return true;
}

/**
 * Extracts raw textual content from a PDF document entirely in-browser using pdfjs-dist.
 * Storage-Free: No Cloud Storage bucket upload required.
 *
 * @param {File} file - PDF document File object
 * @param {Function} [onProgress] - Callback for extraction progress percentage
 * @returns {Promise<string>} Clean extracted text content
 */
export async function extractTextFromDocument(file, onProgress = () => {}) {
  validateResumeDocument(file);

  // If plain text file
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    onProgress(100);
    return await file.text();
  }

  try {
    onProgress(10);
    const arrayBuffer = await file.arrayBuffer();
    onProgress(30);

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageLines = [];
      let lastY = null;
      let currentLine = '';

      for (const item of textContent.items) {
        if (!item.str) continue;
        // Group words on similar vertical lines
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          currentLine = item.str;
        } else {
          currentLine += (currentLine ? ' ' : '') + item.str;
        }
        lastY = item.transform[5];
      }
      if (currentLine.trim()) pageLines.push(currentLine.trim());

      fullText += pageLines.join('\n') + '\n\n';

      const progress = Math.min(95, Math.round(30 + (pageNum / numPages) * 65));
      onProgress(progress);
    }

    onProgress(100);
    return fullText.trim();
  } catch (err) {
    console.error('[pdfService] Client-side PDF extraction error:', err);
    throw new Error('Could not read PDF contents. The file may be password-protected, encrypted, or corrupted.');
  }
}
