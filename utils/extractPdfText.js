const fs = require('fs');
const pdfParse = require('pdf-parse');

const extractPdfText = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return null;
  }
};

module.exports = extractPdfText;
