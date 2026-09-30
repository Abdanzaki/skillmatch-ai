/**
 * Storage Service (Repurposed for Storage-Free Architecture)
 * Firebase Cloud Storage is not enabled on this project.
 * All document text extraction is performed entirely in-browser using pdfjs-dist.
 */

import { validateResumeDocument, extractTextFromDocument } from './pdfService';

export { validateResumeDocument, extractTextFromDocument };

/**
 * Validates and processes a resume file entirely client-side.
 * No Cloud Storage bucket upload or raw-file bucket dependency.
 *
 * @param {string} userId - Candidate UID
 * @param {File} file - PDF document file
 * @param {Function} [onProgress] - Extraction progress callback
 * @returns {Promise<{ text: string, fileName: string, fileSizeBytes: number, mimeType: string }>}
 */
export async function processResumeFileClientSide(userId, file, onProgress = () => {}) {
  validateResumeDocument(file);
  const text = await extractTextFromDocument(file, onProgress);

  return {
    text,
    fileName: file.name,
    fileSizeBytes: file.size,
    mimeType: file.type || 'application/pdf'
  };
}
