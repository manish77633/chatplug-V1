const axios = require('axios');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Extract text from PDF buffer using pdf-parse
 */
exports.extractFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF has no extractable text');
    }

    return {
      text: data.text.trim(),
      pageCount: data.numpages,
      charCount: data.text.length,
    };
  } catch (err) {
    console.error('[PDF] pdf-parse failed:', err.message);
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
