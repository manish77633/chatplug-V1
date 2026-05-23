const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extract text from PDF buffer using pdfjs-dist (production-safe)
 */
exports.extractFromPDF = async (buffer) => {
  try {
    // Use pdfjs-dist which works reliably in production without test files
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = false; // Disable worker for Node.js

    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array, disableFontFace: true, verbosity: 0 });
    const pdfDoc = await loadingTask.promise;

    let fullText = '';
    const pageCount = pdfDoc.numPages;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return {
      text: fullText.trim(),
      pageCount,
      charCount: fullText.length,
    };
  } catch (err) {
    console.error('[PDF] pdfjs-dist failed:', err.message);
    throw new Error('Could not extract text from PDF: ' + err.message);
  }
};

/**
 * Scrape text from URL using cheerio
 */
exports.extractFromURL = async (url) => {
  const { data: html } = await axios.get(url, {
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0 (EmbedIQ Bot)' },
  });

  const $ = cheerio.load(html);

  // Remove noise elements
  $('script, style, nav, footer, header, .ad, #ad, iframe, noscript').remove();

  // Extract meaningful text
  const title = $('title').text().trim();
  const body  = $('body').text().replace(/\s+/g, ' ').trim();

  const text = `Title: ${title}\n\n${body}`;
  return { text, charCount: text.length, pageCount: 1 };
};

/**
 * Extract plain text (for manual input)
 */
exports.extractFromText = (text) => ({
  text,
  charCount: text.length,
  pageCount: 1,
});
